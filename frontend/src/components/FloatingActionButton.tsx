import { AnimatePresence, motion } from "framer-motion";
import { DynamicIcon } from "lucide-react/dynamic";

import React, { useState } from "react";

interface FloatingActionButtonProps {
  icon: "plus";
  size?: number;
  text: string;
  action: () => void | Promise<void>;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  size,
  text,
  action,
}) => {
  const [expandCreateJob, setExpandCreateJob] = useState<boolean>(false);

  return (
    <motion.div
      className="flex fixed bottom-24 sm:bottom-10 right-8 sm:right-10 btn border-none z-[10] h-14 rounded-full shadow-xl bg-Gradient2 text-white justify-center items-center"
      onMouseEnter={() => setExpandCreateJob(true)}
      onMouseLeave={() => setExpandCreateJob(false)}
      onClick={action}
      initial={{
        width: "3.5rem",
        paddingLeft: "1rem",
        paddingRight: "1rem",
      }}
      animate={{
        width: expandCreateJob ? "8rem" : "3.5rem",
        paddingLeft: expandCreateJob ? "1.5rem" : "1rem",
        paddingRight: expandCreateJob ? "1.5rem" : "1rem",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {expandCreateJob ? (
          <motion.button
            key="text"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="w-fit h-full whitespace-nowrap"
          >
            {text}
          </motion.button>
        ) : (
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-fit"
          >
            <DynamicIcon name={icon} size={size ? size : 30} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingActionButton;
