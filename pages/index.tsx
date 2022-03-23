import type { NextPage } from 'next'

import { initPeer } from 'utils/peer';

import { useEffect, useState } from 'react';

let peer;

async function startCapture(displayMediaOptions) {
  let captureStream = null;

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch(err) {
    console.error("Error: " + err);
  }
  return captureStream;
}

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [value, setValue] = useState('');
  useEffect(() => {
    const initTerminal = async () => {
      const { default: Peer } = await import('peerjs')
      console.log(Peer)
      peer = initPeer(Peer);
      peer.subscribeOpen(
        (id: string) => {
          setPeerId(id);
        },
      );

      peer.subscribeDataReceive(({ key, payload }) => {
        switch (key) {
          case 'connected': {
            const { id } = payload;
            setIsConnected(true);
            setValue(id);
            break;
          }
        }
      });

      peer.peer.on('call', async (call) => {
        console.log('call', call);

        const stream = await startCapture({ video: true });
        call.answer(stream);

        call.on('stream', (remoteStream: any) => {
          // Show stream in some video/canvas element.
          const video = document.getElementById('peer');
          video.srcObject = remoteStream;
          video.play();

        });
      });
    }
    initTerminal()
    
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { currentTarget: { value } } = e;
    setValue(value);
  }

  const handleButtonClick = () => {
    peer.connect(value);
    setIsConnected(true);
  }

  const handleClick = async () => {

    const stream = await startCapture({ video: true, audio: true });
    console.log(stream)

      var call = peer.peer.call(value, stream);
      call.on('stream', function(remoteStream) {
        const video = document.getElementById('peer');
        video.srcObject = remoteStream;
        video.play()
        // Show stream in some video/canvas element.
      });
;
  };
  return (
<div className="container is-flex is-flex-direction-column">
      <section className="section is-flex is-flex-direction-column">
        <div className="field">
          <label className="label">My ID</label>
          <div className="control">
            <input className="input" value={peerId} disabled />
          </div>
        </div>
        <div className="field">
          <label className="label">Peer ID</label>
          <div className="control">
            <input className="input" onChange={handleChange} value={value} />
          </div>
        </div>
        <button className="button is-primary" onClick={handleButtonClick} disabled={isConnected}>
          {isConnected ? '연결 중' : '연결'}
        </button>
        <button onClick={handleClick}>비디오</button>
      </section>
      <video id="peer" />
    </div>
  );
  
}
export default Home
