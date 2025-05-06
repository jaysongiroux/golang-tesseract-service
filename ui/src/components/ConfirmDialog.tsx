import { Loader2 } from "lucide-react";
import { GlowingButton } from "./GlowingButton";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  loading?: boolean;
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={!!open} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-950 text-slate-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={loading}
              variant="outline"
              className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>

          <GlowingButton
            disabled={loading}
            variant="destructive"
            onClick={onConfirm}
          >
            <span className="relative text-slate-50 flex flex-row items-center justify-center">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </span>
          </GlowingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
