import { memo } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import TemplateMinimal from './TemplateMinimal';
import TemplateDark from './TemplateDark';
import TemplateGradient from './TemplateGradient';

const TEMPLATES = {
  minimal:   TemplateMinimal,
  developer: TemplateDark,
  designer:  TemplateGradient,
};

const PortfolioPreview = memo(function PortfolioPreview({ scale = 0.55 }) {
  const portfolio = useSelector(s => s.portfolio.data);
  const template = portfolio?.template || 'minimal';
  const TemplateComponent = TEMPLATES[template] || TemplateMinimal;

  const isEmpty = !portfolio || (!portfolio.personalInfo?.fullName && !portfolio.projects?.length);

  if (isEmpty) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '400px', color: 'var(--text-muted)', gap: '12px',
      }}>
        <div style={{ fontSize: '48px' }}>🖼️</div>
        <p style={{ fontSize: '14px' }}>Start filling in your details to see the live preview</p>
      </div>
    );
  }

  return (
    <div style={{ transformOrigin: 'top center', transform: `scale(${scale})`, width: `${100 / scale}%`, marginLeft: `${-(100 / scale - 100) / 2}%`, pointerEvents: 'none' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={template}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <TemplateComponent portfolio={portfolio} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default PortfolioPreview;
