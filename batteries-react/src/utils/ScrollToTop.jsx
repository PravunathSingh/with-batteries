import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const ScrollToTop = (props) => {
  const location = useLocation();
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) { 
      return;
    }
    isMounted.current = true;
    
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export default ScrollToTop;
