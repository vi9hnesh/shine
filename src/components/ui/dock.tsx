import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Grid3X3, Calendar, Clock } from "lucide-react"

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
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  className?: string
  isActive?: boolean
  showLabel?: boolean
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

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25
    }
  }
}

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
                scale: 1.1,
                y: -10,
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
      { icon: Icon, label, onClick, className, isActive = false, showLabel = false },
      ref
    ) => {
      const [isHovered, setIsHovered] = React.useState(false)

      return (
        <motion.button
          ref={ref}
          whileHover={{
            scale: 1.08,
            y: -2,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 15
            }
          }}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative group p-2 rounded-xl bg-white/70 backdrop-blur-md shadow-md",
            "sm:p-3 sm:rounded-none sm:border-2 sm:border-black sm:bg-white sm:shadow-none",
            "hover:bg-white/80 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
            isActive && "bg-black text-white hover:bg-gray-800",
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
                  "hidden sm:block absolute -top-12 left-1/2 -translate-x-1/2",
                  "px-2 py-1 border-2 border-black bg-white text-black",
                  "text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                )}
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                {label}
                {/* Arrow */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid black"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent label for mobile or when explicitly shown */}
          {(showLabel || true) && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-black whitespace-nowrap sm:hidden">
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
  ({ items, className, showLabels = false, currentTime }, ref) => {
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

      return (
        <>
          <div
            ref={ref}
            className={cn(
              "fixed left-1/2 -translate-x-1/2 z-50 bottom-4 sm:bottom-6",
              className
            )}
          >
            <div
              className={cn(
                "flex items-center gap-6 px-4 py-3 rounded-3xl bg-white/60 backdrop-blur-md shadow-lg",
                "sm:gap-1 sm:p-2 sm:border-2 sm:border-black sm:bg-white sm:backdrop-blur-sm sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:rounded-none"
              )}
            >
              {/* App Icons */}
              {dockItemsWithLaunchpad.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <DockIconButton {...item} showLabel={showLabels} />
                </div>
              ))}

              {/* Separator */}
              {currentTime && (
                <div className="hidden sm:block w-px h-8 bg-black mx-2" />
              )}

              {/* Date & Time Display */}
              {currentTime && (
                <div className="hidden sm:flex items-center gap-2 px-3">
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
              <div className="hidden sm:flex items-center justify-center mt-2">
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