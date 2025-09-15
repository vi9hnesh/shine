"use client";
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Grid3X3 } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

type DockPosition = 'bottom' | 'left' | 'right'

interface DockProps {
  className?: string
  items: {
    icon: LucideIcon
    label: string
    onClick?: () => void
    isActive?: boolean
  }[]
  showLabels?: boolean
  currentTime?: Date
  position?: DockPosition
  onPositionChange?: (position: DockPosition) => void
  isDraggable?: boolean // deprecated; no-op after removing DnD
  showPositionSelector?: boolean
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  className?: string
  isActive?: boolean
  showLabel?: boolean
  position?: DockPosition
  index?: number
}

interface AppsProps {
  items: {
    icon: LucideIcon
    label: string
    onClick?: () => void
    isActive?: boolean
  }[]
  onClose: () => void
}

// Animation variants for dock items (kept for potential future use)
// const itemVariants = {
//   hidden: { scale: 0, opacity: 0 },
//   visible: { 
//     scale: 1, 
//     opacity: 1,
//     transition: {
//       type: "spring",
//       stiffness: 500,
//       damping: 25
//     }
//   }
// }

const appsVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
}

// Position selector dropdown
const PositionSelector: React.FC<{ value: DockPosition; onChange?: (p: DockPosition) => void }>
  = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 border-2 border-black bg-white px-2 py-1 text-xs font-bold tracking-wider">
      <span>DOCK</span>
      <select
        className="bg-transparent outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange?.(e.target.value as DockPosition)}
      >
        <option value="bottom">Bottom</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </label>
  );
}

const Apps: React.FC<AppsProps> = ({ items, onClose }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={appsVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      style={{ backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl p-8" onClick={(e) => e.stopPropagation()}>

        {/* Apps grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {items.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ 
                scale: 1.05,
                y: -4,
                transition: { 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15 
                }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={item.onClick}
              className="flex flex-col items-center cursor-pointer"
            >
              <div 
                className={cn(
                  "p-6 border-2 bg-white/20 backdrop-blur-md",
                  "hover:bg-white/30 transition-colors duration-200",
                  "mb-3",
                  item.isActive ? "border-white bg-white/40" : "border-white/50"
                )}
                style={{ 
                  borderRadius: '0px',
                  boxShadow: '4px 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-sm font-medium tracking-wide">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}


const DockIconButton = React.memo(
  React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
    (
      { icon: Icon, label, onClick, className, isActive = false, showLabel = false, position = 'bottom', index = 0 },
      ref
    ) => {
      const getTooltipSide = () => {
        switch (position) {
          case 'left':
            return 'right' as const
          case 'right':
            return 'left' as const
          default:
            return 'top' as const
        }
      }

      const getLabelClasses = () => {
        switch (position) {
          case 'left':
            return "absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black whitespace-nowrap"
          case 'right':
            return "absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black whitespace-nowrap"
          default:
            return "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-black whitespace-nowrap"
        }
      }

      const getHoverAnimation = () => {
        switch (position) {
          case 'left':
          case 'right':
            return {
              scale: 1.05,
              x: position === 'left' ? -1 : 1,
              transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 25
              }
            }
          default:
            return {
              scale: 1.05,
              y: -1,
              transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 25
              }
            }
        }
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              ref={ref}
              whileHover={getHoverAnimation()}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.05 }
              }}
              onClick={onClick}
              className={cn(
                "relative group p-3 border-2 border-black bg-white",
                "hover:bg-white/80 transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                isActive &&
                  "bg-black text-white hover:bg-gray-800",
                className
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-black"
                )}
              />

              {/* Optional label for larger screens */}
              {showLabel && (
                <div className={getLabelClasses()}>
                  {label}
                </div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={getTooltipSide()}
              sideOffset={8}
              className={cn(
                "px-2 py-1 border-2 border-black bg-white text-black",
                "text-xs font-medium whitespace-nowrap z-[100]"
              )}
              style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            >
              {label}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </Tooltip>
      )
    }
  )
)
DockIconButton.displayName = "DockIconButton"


const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className, showLabels = false, currentTime, position = 'bottom', onPositionChange, isDraggable = false, showPositionSelector = false }, ref) => {
    const [showLaunchpad, setShowLaunchpad] = React.useState(false);

    const handleLaunchpadClick = () => {
      setShowLaunchpad(true);
    };

    const closeLaunchpad = () => {
      setShowLaunchpad(false);
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };

    // DnD removed. Double-click to cycle still available as a convenience when desired.

    const dockItemsWithLaunchpad = [
      ...items,
      {
        icon: Grid3X3,
        label: "Apps",
        onClick: handleLaunchpadClick,
        isActive: false
      }
    ];

    const getDockPositionClasses = () => {
      switch (position) {
        case 'left':
          return "fixed left-6 top-1/2 -translate-y-1/2 z-50"
        case 'right':
          return "fixed right-6 top-1/2 -translate-y-1/2 z-50"
        default:
          return "fixed left-1/2 -translate-x-1/2 z-50 bottom-6"
      }
    }

    const getDockContainerClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      
      if (isVertical) {
        return cn(
          "flex flex-col items-center gap-1 p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        )
      }
      
      return cn(
        "flex items-center gap-1 p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      )
    }

    const getSeparatorClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      return isVertical 
        ? "h-px w-8 bg-black my-2" 
        : "w-px h-8 bg-black mx-2"
    }

    const getTimeDisplayClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      return isVertical 
        ? "flex flex-col items-center gap-2 py-3"
        : "flex items-center gap-2 px-3"
    }

    const getLabelContainerClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      
      if (isVertical) {
        const sideClass = position === 'left' ? 'ml-2' : 'mr-2'
        return `flex items-center justify-center ${sideClass}`
      }
      
      return "flex items-center justify-center mt-2"
    }
    // no composed ref needed; parent can still pass ref directly

      return (
        <TooltipProvider>
          <div
            ref={ref}
            className={cn(
              getDockPositionClasses(),
              className
            )}
          >
            <div 
              className={getDockContainerClasses()}
              onDoubleClick={() => {
                if (!isDraggable && onPositionChange) {
                  // Cycle through positions on double-click when not draggable
                  const positions: DockPosition[] = ["bottom", "left", "right"];
                  const currentIndex = positions.indexOf(position);
                  const nextIndex = (currentIndex + 1) % positions.length;
                  onPositionChange(positions[nextIndex]);
                }
              }}
            >
              {/* Position selector */}
              {showPositionSelector && (
                <PositionSelector value={position} onChange={onPositionChange} />
              )}

              {/* App Icons */}
              {dockItemsWithLaunchpad.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <DockIconButton {...item} showLabel={showLabels} position={position} index={index} />
                </div>
              ))}

              {/* Separator */}
              {currentTime && (
                <div className={getSeparatorClasses()} />
              )}

              
            </div>

            {showLabels && (
              <div className={getLabelContainerClasses()}>
                <div className="border-2 border-black bg-black text-white px-2 py-1 text-xs font-bold tracking-wider">
                  SHINE DOCK
                </div>
              </div>
            )}
          </div>

          {/* Apps Overlay */}
          <AnimatePresence>
            {showLaunchpad && (
              <Apps items={items} onClose={closeLaunchpad} />
            )}
          </AnimatePresence>
        </TooltipProvider>
      )
  }
)
Dock.displayName = "Dock"

export { Dock, DockIconButton }
export type { DockPosition }
