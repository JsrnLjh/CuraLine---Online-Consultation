import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Send, 
  Maximize2, Minimize2, Settings, Users, MessageCircle,
  Camera, Monitor, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ConsultationRoom.css';

function ConsultationRoom() {
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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    fetchConsultation();
    initializeMedia();
    
    // Poll for messages every 2 seconds
    const messageInterval = setInterval(fetchMessages, 2000);
    
    return () => {
      clearInterval(messageInterval);
      stopMedia();
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
      alert('Failed to load consultation');
      navigate('/consultations');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/consultation-room/${consultationId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      localStreamRef.current = stream;
      setConnectionStatus('connected');
      
      // In a real app, this would establish WebRTC connection
      // For demo, we'll simulate it
    } catch (err) {
      console.error('Failed to access media devices:', err);
      alert('Please allow camera and microphone access to start the consultation');
      setConnectionStatus('disconnected');
    }
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initializeMedia();
        };
      } catch (err) {
        console.error('Failed to share screen:', err);
      }
    } else {
      setIsScreenSharing(false);
      initializeMedia();
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(`/api/consultation-room/${consultationId}/messages`, {
        senderId: user.id,
        senderName: user.name,
        message: newMessage,
        timestamp: new Date().toISOString()
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const endCall = async () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      stopMedia();
      
      // Update consultation status
      try {
        await axios.patch(`/api/consultations/${consultationId}`, { 
          status: 'completed' 
        });
      } catch (err) {
        console.error('Failed to update consultation status');
      }
      
      navigate('/consultations');
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="consultation-room-loading">
        <div className="loading">Loading consultation room...</div>
      </div>
    );
  }

  const isDoctor = user.role === 'doctor';
  const otherParty = isDoctor ? consultation.patientName : consultation.doctorName;

  return (
    <div className="consultation-room">
      {/* Header */}
      <div className="room-header">
        <div className="room-info">
          <Users size={20} />
          <div>
            <h3>Consultation with {otherParty}</h3>
            <span className={`status-indicator ${connectionStatus}`}>
              {connectionStatus === 'connected' ? '● Connected' : 
               connectionStatus === 'connecting' ? '○ Connecting...' : 
               '○ Disconnected'}
            </span>
          </div>
        </div>
        <div className="room-actions">
          <button onClick={toggleFullscreen} className="icon-btn" title="Fullscreen">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="icon-btn" title="Toggle Chat">
            <MessageCircle size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="room-content">
        {/* Video Area */}
        <div className={`video-area ${!isChatOpen ? 'full-width' : ''}`}>
          {/* Remote Video (Other Person) */}
          <div className="remote-video-container">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline
              className="remote-video"
            />
            <div className="video-placeholder">
              <Users size={80} />
              <p>{otherParty}</p>
              <small>Waiting for connection...</small>
            </div>
            <div className="remote-video-label">{otherParty}</div>
          </div>

          {/* Local Video (You) */}
          <div className="local-video-container">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted
              className="local-video"
            />
            {!isVideoOn && (
              <div className="video-off-overlay">
                <Camera size={40} />
                <p>Camera Off</p>
              </div>
            )}
            <div className="local-video-label">You</div>
          </div>

          {/* Controls */}
          <div className="video-controls">
            <button 
              onClick={toggleAudio} 
              className={`control-btn ${!isAudioOn ? 'off' : ''}`}
              title={isAudioOn ? 'Mute' : 'Unmute'}
            >
              {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            
            <button 
              onClick={toggleVideo} 
              className={`control-btn ${!isVideoOn ? 'off' : ''}`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            
            <button 
              onClick={toggleScreenShare} 
              className={`control-btn ${isScreenSharing ? 'active' : ''}`}
              title="Share screen"
            >
              <Monitor size={24} />
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

        {/* Chat Area */}
        {isChatOpen && (
          <div className="chat-area">
            <div className="chat-header">
              <h4>
                <MessageCircle size={18} />
                Chat
              </h4>
              <button onClick={() => setIsChatOpen(false)} className="close-chat">
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <MessageCircle size={48} color="#d1d5db" />
                  <p>No messages yet</p>
                  <small>Start the conversation</small>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.senderId === user.id ? 'own' : 'other'}`}
                  >
                    <div className="message-header">
                      <strong>{msg.senderName}</strong>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationRoom;
