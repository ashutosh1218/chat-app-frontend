import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import ChatInput from './ChatInput';
import Logout from './Logout';
import axios from 'axios'
import {getAllMsgRoute, sendMessageRoute} from '../utils/APIRoutes'
import {v4 as uuidv4} from 'uuid'
function ChatContainer({ currentChat, currentUser, socket }) {
    const [messages, setMessages]=useState([]);
    const [arrivalMessage, setArrivalMessage]=useState(null);
    const scrollRef=useRef();
    useEffect(()=>{
        const func=async ()=>{
            if(currentChat){
                // console.log(currentUser);
                const response=await axios.post(getAllMsgRoute, {
                    from:currentUser._id,
                    to:currentChat._id,
                });
                const temp=[];
                response.data.forEach((res)=>{
                    const fromSelf=res.fromSelf;
                    const message=res.message;
                    let time=String(new Date(res.time));
                    const arr=time.split(' ');
                    time=arr[4].slice(0, 5);
                    const obj={
                        fromSelf:fromSelf,
                        message:message,
                        time: time
                    }
                    temp.push(obj);
                })
                // console.log(String(new Date(response.data[0].time)));
                setMessages(temp);

            }
        }
        func();
    }, [currentChat]);

    const handleSendMessage=async (msg)=>{
        await axios.post(sendMessageRoute, {
            from:currentUser._id,
            to:currentChat._id,
            message:msg
        });
        socket.current.emit("send-msg", {
            to:currentChat._id,
            from:currentUser._id,
            message:msg
        });
        var today= new Date().toLocaleTimeString().slice(0, 5);
        
        const msgs=[...messages];
        msgs.push({fromSelf:true, message:msg});
        setMessages(msgs);
    }
    useEffect(()=>{
        if(socket.current){
            socket.current.on("msg-recieve", (msg)=>{
                var today= new Date().toLocaleTimeString().slice(0, 5);
                setArrivalMessage({fromSelf:false, message:msg})
            })
        }
    }, []);
    useEffect(()=>{
        arrivalMessage && setMessages((prev)=>[...prev, arrivalMessage]);
    }, [arrivalMessage]);
    useEffect(()=>{
        scrollRef.current?.scrollIntoView({behaviour:"smooth"})
    }, [messages]);
    return (
        <>
            {
                currentChat && (
                    <Container>
                        <div className="chat-header">
                            <div className="user-details">
                                <div className="avatar">
                                    <img
                                        src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                                        alt=""
                                    />
                                </div>
                                <div className="username">
                                    <h3>{currentChat.username}</h3>
                                </div>
                            </div>
                            <Logout/>
                        </div>
                        <div className="chat-messages">
                            {
                                messages.map((message)=>{
                                    return(
                                        <div ref={scrollRef} key={uuidv4()}>
                                           <div className={`message ${message.fromSelf?"sended":"received"}`}>
                                                <div className="content">
                                                    <p>{message.message} <span className='time'>{message.time}</span></p>
                                                </div>
                                           </div> 
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <ChatInput handleSendMessage={handleSendMessage}/>
                    </Container>
                )
            }
        </>
    )
}
const Container = styled.div`
    display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
          
        }
      }
    }
    .time{
            font-size:0.7rem;
          }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
export default ChatContainer
