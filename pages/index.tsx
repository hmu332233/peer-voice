import type { NextPage } from 'next';
import { useEffect, useState, useRef } from 'react';

import type Peer from 'peerjs';

import Audio from 'components/Audio';

async function startCapture() {
  let captureStream = undefined;

  try {
    captureStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('Error: ' + err);
  }
  return captureStream;
}

const Home: NextPage = () => {
  const peer = useRef<Peer>();
  // const [isConnected, setIsConnected] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [value, setValue] = useState('');

  const [audioStreams, setAudioStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    const init = async () => {
      const { default: Peer } = await import('peerjs');

      peer.current = new Peer({
        secure: true,
        host: process.env.NEXT_PUBLIC_PEER_SERVER,
        port: 443,
      });

      peer.current.on('open', (id: string) => {
        console.log('open', id);
        setPeerId(id);
      });

      peer.current.on('call', async (call) => {
        const stream = await startCapture();
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          setAudioStreams((v) => [...v, remoteStream]);
        });
      });
    };
    init();
  }, []);

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(peerId as string);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = e;
    setValue(value);
  };

  const handleClick = async () => {
    const stream = await startCapture();

    if (!peer.current || !stream) {
      return;
    }

    const call = peer.current.call(value, stream);
    call.on('stream', (remoteStream) => {
      setAudioStreams((v) => [...v, remoteStream]);
    });
  };
  return (
    <div>
      <section>
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

        <button className="btn" onClick={handleCopyClick}>
          Id 복사
        </button>
        <button className="btn" onClick={handleClick}>
          통화 연결하기
        </button>
        {audioStreams.map((stream) => (
          <div key={stream.id}>
            {stream.id}
            <Audio key={stream.id} stream={stream} />
          </div>
        ))}
      </section>
    </div>
  );
};
export default Home;
