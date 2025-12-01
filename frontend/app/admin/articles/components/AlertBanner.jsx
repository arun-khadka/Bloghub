import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

/**
 * @typedef {'error' | 'warning' | 'success' | 'info'} AlertType
 */

/**
 * @typedef {Object} AlertBannerProps
 * @property {AlertType} type - Type of alert
 * @property {string} title - Alert title
 * @property {string} message - Alert message
 * @property {() => void} [onClose] - Function to close the alert
 * @property {boolean} [show] - Whether to show the alert
 * @property {boolean} [dismissible] - Whether alert can be dismissed
 */

const alertVariants = {
  error: {
    variant: "destructive",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  warning: {
    variant: "warning",
    icon: AlertCircle,
    iconColor: "text-amber-600",
  },
  success: {
    variant: "success",
    icon: AlertCircle,
    iconColor: "text-green-600",
  },
  info: {
    variant: "default",
    icon: AlertCircle,
    iconColor: "text-blue-600",
  },
};

/**
 * Reusable alert banner component
 * @param {AlertBannerProps} props
 */
export default function AlertBanner({
  type = "error",
  title,
  message,
  onClose,
  show = true,
  dismissible = true,
}) {
  if (!show || !message) return null;

  const { variant, icon: Icon, iconColor } = alertVariants[type];

  return (
    <Alert variant={variant} className="relative">
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
          <AlertDescription className="text-sm mt-1">
            {message}
          </AlertDescription>
        </div>
        {dismissible && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

AlertBanner.propTypes = {
  type: PropTypes.oneOf(["error", "warning", "success", "info"]),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  show: PropTypes.bool,
  dismissible: PropTypes.bool,
};

AlertBanner.defaultProps = {
  type: "error",
  title: null,
  onClose: null,
  show: true,
  dismissible: true,
};
