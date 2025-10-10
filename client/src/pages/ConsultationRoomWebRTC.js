import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Send, 
  Maximize2, Minimize2, Users, MessageCircle, Monitor, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ConsultationRoom.css';

// Get socket server URL from environment or detect from window location
const getSocketServerUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  // In production, use the same host as the client
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  // In development, try to use the local network IP if available
  return 'http://localhost:5000';
};

const SOCKET_SERVER = getSocketServerUrl();

// ICE servers for WebRTC (STUN and TURN servers for NAT traversal)
const ICE_SERVERS = {
  iceServers: [
    // Google STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Public TURN servers (for testing - replace with your own in production)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
};

function ConsultationRoomWebRTC() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteUser, setRemoteUser] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    fetchConsultation();
    initializeSocketAndMedia();
    
    return () => {
      cleanup();
    };
  }, [consultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConsultation = async () => {
    try {
      const response = await axios.get(`/api/consultations/${consultationId}`);
      setConsultation(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch consultation:', err);
      setLoading(false);
    }
  };

  const initializeSocketAndMedia = async () => {
    try {
      console.log('🔌 Connecting to socket server:', SOCKET_SERVER);
      
      // Initialize Socket.io connection
      socketRef.current = io(SOCKET_SERVER, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to signaling server:', socketRef.current.id);
        console.log('🌐 Socket transport:', socketRef.current.io.engine.transport.name);
        setConnectionStatus('connected');
        
        // Join the consultation room
        socketRef.current.emit('join-room', {
          roomId: consultationId,
          userId: user.id,
          userName: user.name,
          userRole: user.role
        });
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        console.error('Server URL:', SOCKET_SERVER);
        setConnectionStatus('error');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Disconnected from signaling server. Reason:', reason);
        setConnectionStatus('disconnected');
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        setConnectionStatus('connected');
      });

      // Handle room participants
      socketRef.current.on('room-participants', (participants) => {
        console.log('👥 Room participants:', participants);
        if (participants.length > 0) {
          setRemoteUser(participants[0]);
        }
      });

      // Handle user joined
      socketRef.current.on('user-joined', async ({ socketId, userId, userName, userRole }) => {
        console.log('👤 User joined:', userName);
        setRemoteUser({ socketId, userId, userName, userRole });
        
        // Create peer connection and send offer
        await createPeerConnection(socketId);
        await createAndSendOffer(socketId);
      });

      // Handle WebRTC offer
      socketRef.current.on('webrtc-offer', async ({ offer, senderSocketId, senderInfo }) => {
        console.log('📥 Received offer from:', senderInfo.userName);
        setRemoteUser(senderInfo);
        
        await createPeerConnection(senderSocketId);
        await handleOffer(offer, senderSocketId);
      });

      // Handle WebRTC answer
      socketRef.current.on('webrtc-answer', async ({ answer, senderSocketId }) => {
        console.log('📥 Received answer');
        await handleAnswer(answer);
      });

      // Handle ICE candidate
      socketRef.current.on('ice-candidate', async ({ candidate, senderSocketId }) => {
        console.log('🧊 Received ICE candidate');
        await handleIceCandidate(candidate);
      });

      // Handle user left
      socketRef.current.on('user-left', ({ userName }) => {
        console.log('👋 User left:', userName);
        setRemoteUser(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      // Handle chat messages
      socketRef.current.on('chat-message', ({ message, senderId, senderName, timestamp }) => {
        setMessages(prev => [...prev, {
          senderId,
          senderName,
          message,
          timestamp: new Date(timestamp)
        }]);
      });

      // Initialize local media
      await initializeMedia();

    } catch (err) {
      console.error('❌ Failed to initialize:', err);
      console.error('Error details:', err.message);
      setConnectionStatus('error');
      alert(`Connection failed: ${err.message}. Please check your network and try again.`);
    }
  };

  const createPeerConnection = async (targetSocketId) => {
    try {
      console.log('🔗 Creating peer connection with ICE servers:', ICE_SERVERS);
      
      // Create new peer connection
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log('📹 Received remote stream');
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteStreamRef.current = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
          socketRef.current.emit('ice-candidate', {
            roomId: consultationId,
            candidate: event.candidate,
            targetSocketId
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        console.log('🔗 Peer connection state:', state);
        
        if (state === 'connected') {
          console.log('✅ Peer connection established successfully!');
          setConnectionStatus('connected');
        } else if (state === 'disconnected') {
          console.log('⚠️ Peer connection disconnected');
          setConnectionStatus('disconnected');
        } else if (state === 'failed') {
          console.error('❌ Peer connection failed');
          setConnectionStatus('error');
        } else if (state === 'connecting') {
          console.log('🔄 Peer connection attempting to connect...');
          setConnectionStatus('connecting');
        }
      };

      // Handle ICE connection state changes
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const iceState = peerConnectionRef.current.iceConnectionState;
        console.log('🧊 ICE connection state:', iceState);
        
        if (iceState === 'failed' || iceState === 'disconnected') {
          console.error('❌ ICE connection issue. May need TURN server.');
        }
      };

      // Handle ICE gathering state
      peerConnectionRef.current.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', peerConnectionRef.current.iceGatheringState);
      };

      console.log('✅ Peer connection created');
    } catch (err) {
      console.error('Failed to create peer connection:', err);
    }
  };

  const createAndSendOffer = async (targetSocketId) => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      console.log('📤 Sending offer');
      socketRef.current.emit('webrtc-offer', {
        roomId: consultationId,
        offer,
        targetSocketId
      });
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  };

  const handleOffer = async (offer, senderSocketId) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      console.log('📤 Sending answer');
      socketRef.current.emit('webrtc-answer', {
        roomId: consultationId,
        answer,
        targetSocketId: senderSocketId
      });
    } catch (err) {
      console.error('Failed to handle offer:', err);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Answer set successfully');
    } catch (err) {
      console.error('Failed to handle answer:', err);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added');
    } catch (err) {
      console.error('Failed to add ICE candidate:', err);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('✅ Local media initialized');
    } catch (err) {
      console.error('Failed to get media:', err);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        
        socketRef.current.emit('toggle-video', {
          roomId: consultationId,
          enabled: videoTrack.enabled
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        
        socketRef.current.emit('toggle-audio', {
          roomId: consultationId,
          enabled: audioTrack.enabled
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
        
        screenTrack.onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
        socketRef.current.emit('start-screen-share', { roomId: consultationId });
      } else {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(false);
        socketRef.current.emit('stop-screen-share', { roomId: consultationId });
      }
    } catch (err) {
      console.error('Screen sharing failed:', err);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', {
        roomId: consultationId,
        message: newMessage,
        senderId: user.id,
        senderName: user.name
      });
      
      setNewMessage('');
    }
  };

  const endCall = async () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      cleanup();
      navigate('/consultations');
    }
  };

  const cleanup = () => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: consultationId });
      socketRef.current.disconnect();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading consultation room...</div>;
  }

  return (
    <div className={`consultation-room ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="room-header">
        <div className="room-info">
          <h2>Video Consultation</h2>
          <span className={`status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢 Connected' : 
             connectionStatus === 'connecting' ? '🟡 Connecting...' : 
             '🔴 Disconnected'}
          </span>
        </div>
        <div className="room-actions">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="icon-btn">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="room-content">
        <div className="video-container">
          <div className="remote-video-wrapper">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              className="remote-video"
            />
            {!remoteUser && (
              <div className="waiting-message">
                <Users size={48} />
                <p>Waiting for the other participant to join...</p>
              </div>
            )}
            {remoteUser && (
              <div className="remote-user-info">
                <span>{remoteUser.userName}</span>
              </div>
            )}
          </div>

          <div className="local-video-wrapper">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted
              className="local-video"
            />
            <div className="local-user-label">You</div>
          </div>

          <div className="video-controls">
            <button 
              onClick={toggleVideo} 
              className={`control-btn ${!isVideoOn ? 'off' : ''}`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            <button 
              onClick={toggleAudio} 
              className={`control-btn ${!isAudioOn ? 'off' : ''}`}
              title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            <button 
              onClick={toggleScreenShare} 
              className={`control-btn ${isScreenSharing ? 'active' : ''}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <Monitor size={24} />
            </button>

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)} 
              className="control-btn"
              title="Toggle chat"
            >
              <MessageCircle size={24} />
            </button>

            <button 
              onClick={endCall} 
              className="control-btn end-call"
              title="End call"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>

        {isChatOpen && (
          <div className="chat-panel">
            <div className="chat-header">
              <h3><MessageCircle size={18} /> Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="close-chat">
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.senderId === user.id ? 'own' : 'other'}`}
                >
                  <div className="message-sender">{msg.senderName}</div>
                  <div className="message-content">{msg.message}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="send-btn">
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationRoomWebRTC;
