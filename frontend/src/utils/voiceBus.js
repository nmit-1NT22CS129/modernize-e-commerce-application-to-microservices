let listeners = [];

export const emitVoiceCommand = (cmd) => {
  listeners.forEach((cb) => cb(cmd));
};

export const onVoiceCommand = (cb) => {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
  };
};
