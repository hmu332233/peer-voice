import { useEffect, useRef } from 'react';

type Props = {
  stream: MediaStream;
};

function Audio({ stream }: Props) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.srcObject = stream;
    ref.current.play();
  }, [stream]);

  return <audio ref={ref} />;
}

export default Audio;
