import React from 'react';

type Props = {
  name: string;
};

function Avatar({ name }: Props) {
  return (
    <div className="avatar online placeholder">
      <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
        <span className="text-xl">{name.substring(0, 3)}</span>
      </div>
    </div>
  );
}

export default Avatar;
