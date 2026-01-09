import { useEffect, useRef, useState } from "react";

interface useNodeActiveProps {
  handleOutside?: () => void;
}

export const useNodeActive = <T extends Element>({
  handleOutside,
}: useNodeActiveProps) => {
  const ref = useRef<T>(null);
  const [isActive, setActive] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleOutside?.();
        setActive(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [handleOutside]);

  return { ref, isActive, setActive };
};
