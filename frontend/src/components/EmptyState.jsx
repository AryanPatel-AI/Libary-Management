import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionText, 
  actionLink, 
  actionOnClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif-editorial text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message}
      </p>
      
      {actionLink ? (
        <Link 
          to={actionLink} 
          className="px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
        >
          {actionText}
        </Link>
      ) : actionOnClick ? (
        <button 
          onClick={actionOnClick}
          className="px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};
