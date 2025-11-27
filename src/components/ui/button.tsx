import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-cyan-700 text-white hover:bg-cyan-600 shadow-sm border border-cyan-800/10 rounded-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm rounded-sm",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 hover:text-cyan-700 hover:border-cyan-200 text-slate-700 rounded-sm",
        secondary:
          "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-sm",
        ghost: "hover:bg-slate-100 hover:text-slate-900 rounded-sm",
        link: "text-cyan-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
