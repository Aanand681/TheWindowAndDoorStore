'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GuideTabType, GuideTabsContent } from './guide/GuideTabsContent';
import { GuideTabHeader } from './guide/GuideTabHeader';

interface EstimatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: GuideTabType;
}

export function EstimatorGuideModal({
  isOpen,
  onClose,
  defaultTab = 'fenevision',
}: EstimatorGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTabType>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[88vh] overflow-hidden">
        <GuideTabHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
        />

        <GuideTabsContent activeTab={activeTab} />

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/20 flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">
            The Window &amp; Door Store • Estimator Suite
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EstimatorGuideModal;
