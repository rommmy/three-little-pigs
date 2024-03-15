import { createContext, useContext, useState } from 'react';

export type Camera = {
  toggleOrbitControls: (value: boolean) => void;
  orbitControlsEnabled: boolean;
};

export const CameraContext = createContext<Camera>({
  toggleOrbitControls: (value: boolean) => '',
  orbitControlsEnabled: true,
});

type CameraContextProviderProps = { children?: React.ReactNode };

export const CameraContextProvider = ({
  children,
}: CameraContextProviderProps) => {
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);

  const toggleOrbitControls = (value: boolean) => {
    setOrbitControlsEnabled(value);
  };

  return (
    <CameraContext.Provider
      value={{ toggleOrbitControls, orbitControlsEnabled }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export function useCameraContext(): Camera {
  return useContext(CameraContext);
}
