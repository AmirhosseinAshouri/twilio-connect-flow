
"use client";

import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

type SidebarBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const SidebarBody = React.forwardRef<HTMLDivElement, SidebarBodyProps>(
  (props, ref) => {
    return (
      <>
        <DesktopSidebar {...props} ref={ref} />
        <MobileSidebar {...props} ref={ref} />
      </>
    );
  }
);
SidebarBody.displayName = "SidebarBody";

interface DesktopSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export const DesktopSidebar = React.forwardRef<HTMLDivElement, DesktopSidebarProps>(
  ({ className, children }, ref) => {
    const { open, setOpen, animate } = useSidebar();
    return (
      <motion.div
        ref={ref}
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </motion.div>
    );
  }
);
DesktopSidebar.displayName = "DesktopSidebar";

interface MobileSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export const MobileSidebar = React.forwardRef<HTMLDivElement, MobileSidebarProps>(
  ({ className, children }, ref) => {
    const { open, setOpen } = useSidebar();
    
    const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -50) {
        setOpen(false);
      }
    };

    return (
      <div className="md:hidden">
        <div
          ref={ref}
          className={cn(
            "fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 z-40"
          )}
        >
          <div className="flex justify-end w-full">
            <Menu
              className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 20 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDrag}
                className={cn(
                  "fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-neutral-900 p-6 flex flex-col z-50",
                  className
                )}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Menu</span>
                  <X
                    className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
MobileSidebar.displayName = "MobileSidebar";

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
