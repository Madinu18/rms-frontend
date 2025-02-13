import { Flashbar } from '@cloudscape-design/components';
import { useFlashbar } from '../../context/FlashbarContext';

export const SharedFlashbar = () => {
  const { flashbarItems } = useFlashbar();

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: '20px',
      width: '400px',
      zIndex: 1000
    }}>
      <Flashbar items={flashbarItems} />
    </div>
  );
};