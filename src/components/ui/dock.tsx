import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Grid3X3, Calendar, Clock } from "lucide-react"

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
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  className?: string
  isActive?: boolean
  showLabel?: boolean
  position?: DockPosition
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
      { icon: Icon, label, onClick, className, isActive = false, showLabel = false, position = 'bottom' },
      ref
    ) => {
      const [isHovered, setIsHovered] = React.useState(false)

      const getTooltipClasses = () => {
        switch (position) {
          case 'left':
            return "hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2"
          case 'right':
            return "hidden sm:block absolute -left-12 top-1/2 -translate-y-1/2"
          default:
            return "hidden sm:block absolute -top-12 left-1/2 -translate-x-1/2"
        }
      }

      const getTooltipArrow = () => {
        switch (position) {
          case 'left':
            return (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0"
                style={{
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderLeft: "4px solid black"
                }}
              />
            )
          case 'right':
            return (
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
                style={{
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderRight: "4px solid black"
                }}
              />
            )
          default:
            return (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "4px solid black"
                }}
              />
            )
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
        <motion.button
          ref={ref}
          whileHover={getHoverAnimation()}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.05 }
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative group p-2 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md",
            "sm:p-3 sm:rounded-none sm:border-2 sm:border-black sm:bg-white sm:shadow-none",
            "hover:bg-white/80 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
            isActive &&
              "bg-black text-white hover:bg-gray-800 sm:bg-black sm:text-white sm:hover:bg-gray-800",
            className
          )}
        >
          <Icon
            className={cn(
              "w-7 h-7 sm:w-5 sm:h-5 transition-colors",
              isActive ? "text-white" : "text-black"
            )}
          />

          {/* Tooltip for desktop */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  getTooltipClasses(),
                  "px-2 py-1 border-2 border-black bg-white text-black",
                  "text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                )}
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                {label}
                {getTooltipArrow()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent label for mobile */}
          <div className={cn(getLabelClasses(), "sm:hidden")}>
            {label}
          </div>
          {/* Optional label for larger screens */}
          {showLabel && (
            <div className={cn(getLabelClasses(), "hidden sm:block")}>
              {label}
            </div>
          )}
        </motion.button>
      )
    }
  )
)
DockIconButton.displayName = "DockIconButton"


const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className, showLabels = false, currentTime, position = 'bottom' }, ref) => {
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
          return "fixed left-4 top-1/2 -translate-y-1/2 z-50 sm:left-6"
        case 'right':
          return "fixed right-4 top-1/2 -translate-y-1/2 z-50 sm:right-6"
        default:
          return "fixed left-1/2 -translate-x-1/2 z-50 bottom-4 sm:bottom-6"
      }
    }

    const getDockContainerClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      
      if (isVertical) {
        return cn(
          "flex flex-col items-center gap-4 px-3 py-5 rounded-[28px] bg-white/80 backdrop-blur-xl shadow-lg border border-white/20",
          "sm:gap-1 sm:p-2 sm:border-2 sm:border-black sm:bg-white sm:backdrop-blur-sm sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:rounded-none"
        )
      }
      
      return cn(
        "flex items-center gap-4 px-5 py-3 rounded-[28px] bg-white/80 backdrop-blur-xl shadow-lg border border-white/20",
        "sm:gap-1 sm:p-2 sm:border-2 sm:border-black sm:bg-white sm:backdrop-blur-sm sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:rounded-none"
      )
    }

    const getSeparatorClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      return isVertical 
        ? "hidden sm:block h-px w-8 bg-black my-2" 
        : "hidden sm:block w-px h-8 bg-black mx-2"
    }

    const getTimeDisplayClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      return isVertical 
        ? "hidden sm:flex flex-col items-center gap-2 py-3"
        : "hidden sm:flex items-center gap-2 px-3"
    }

    const getLabelContainerClasses = () => {
      const isVertical = position === 'left' || position === 'right'
      
      if (isVertical) {
        const sideClass = position === 'left' ? 'ml-2' : 'mr-2'
        return `hidden sm:flex items-center justify-center ${sideClass}`
      }
      
      return "hidden sm:flex items-center justify-center mt-2"
    }

      return (
        <>
          <div
            ref={ref}
            className={cn(
              getDockPositionClasses(),
              className
            )}
          >
            <div className={getDockContainerClasses()}>
              {/* App Icons */}
              {dockItemsWithLaunchpad.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <DockIconButton {...item} showLabel={showLabels} position={position} />
                </div>
              ))}

              {/* Separator */}
              {currentTime && (
                <div className={getSeparatorClasses()} />
              )}

              {/* Date & Time Display  only on bottom */}
              {currentTime && position === 'bottom' && (
                <div className={getTimeDisplayClasses()}>
                  <div className="flex items-center gap-2 border-2 border-black px-2 py-1 bg-white">
                    <Calendar className="w-4 h-4 text-black" />
                    <span className="text-xs font-medium text-black">{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 border-2 border-black px-2 py-1 bg-white">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="text-xs font-medium text-black">{formatTime(currentTime)}</span>
                  </div>
                </div>
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
        </>
      )
  }
)
Dock.displayName = "Dock"

export { Dock, DockIconButton }
export type { DockPosition }