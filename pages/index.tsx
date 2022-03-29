import type { NextPage } from 'next';
import { useEffect, useState, useRef } from 'react';

import type Peer from 'peerjs';
import { toast } from 'react-toastify';

import Audio from 'components/Audio';
import Avatar from 'components/Avatar';

async function startCapture() {
  let captureStream = undefined;

  try {
    captureStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') {
      toast.error(
        <div>
          마이크(녹음 장치)가 없습니다.
          <br />
          마이크를 연결해주세요!
        </div>,
      );
    }
  }
  return captureStream;
}

function Home() {
  const peer = useRef<Peer>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [myPeerId, setMyPeerId] = useState('');
  const [yourPeerId, setYourPeerId] = useState('');

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
        setMyPeerId(id);
        setIsInitialized(true);
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
    await navigator.clipboard.writeText(myPeerId as string);
    toast.success(
      <div>
        복사되었습니다!
        <br />
        친구에게 ID를 알려주세요.
      </div>,
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = e;
    setYourPeerId(value);
  };

  const handleConnectClick = async () => {
    if (!yourPeerId) {
      toast.error('친구 ID를 입력해주세요!');
      return;
    }

    const stream = await startCapture();

    if (!peer.current || !stream) {
      return;
    }

    const call = peer.current.call(yourPeerId, stream);
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
        <div className="indicator w-full">
          {!isInitialized && (
            <span className="indicator-item">
              <span className="badge badge-lg animate-bounce">Loading..</span>
            </span>
          )}
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={myPeerId}
            disabled
          />
        </div>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">친구 ID</span>
        </label>
        <input
          type="text"
          placeholder="친구의 ID를 입력하세요."
          className="input input-bordered w-full max-w-xs"
          onChange={handleChange}
          value={yourPeerId}
        />
      </div>
      <button className="btn btn-wide" onClick={handleCopyClick}>
        내 ID 복사
      </button>
      <button className="btn btn-wide" onClick={handleConnectClick}>
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
}

export default Home;
