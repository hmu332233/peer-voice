import type { NextPage } from 'next';
import { useEffect, useState, useRef } from 'react';

import type Peer from 'peerjs';

import Audio from 'components/Audio';
import Avatar from 'components/Avatar';

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
    alert('복사되었습니다!\n친구에게 ID를 알려주세요.');
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
    <div className="flex flex-col items-center gap-y-4">
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">내 ID</span>
        </label>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
          value={peerId}
          disabled
        />
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">친구 ID</span>
        </label>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
          onChange={handleChange}
          value={value}
        />
      </div>
      <button className="btn btn-wide" onClick={handleCopyClick}>
        내 ID 복사
      </button>
      <button className="btn btn-wide" onClick={handleClick}>
        통화 연결하기
      </button>
      <div className="flex justify-center flex-wrap gap-2">
        {audioStreams.map((stream) => (
          <div key={stream.id}>
            <Avatar name={stream.id} />
            <Audio key={stream.id} stream={stream} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Home;
