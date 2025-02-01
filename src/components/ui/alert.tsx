import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ")
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "relative w-full rounded-lg border p-4"
    const backgroundStyles = "bg-background text-foreground"
    const variantStyles = variant === "destructive" 
      ? "border-red-500 text-red-900 bg-red-50" 
      : "border-gray-200"

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          baseStyles,
          backgroundStyles,
          variantStyles,
          className ?? ""
        )}
        {...props}
      />
    )
  }
)

Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-2 text-sm text-muted-foreground", className ?? "")}
        {...props}
      />
    )
  }
)

AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
export type { AlertProps, AlertDescriptionProps }