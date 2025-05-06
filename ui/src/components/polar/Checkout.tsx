import { Button } from "../ui/button";
import { useUser } from "@/providers";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Checkout = ({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) => {
  const { selectedOrg } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/protected/polar/checkout?productId=${productId}&organizationId=${selectedOrg?.id}`
      );
      const data = await resp.json();
      const error = data?.error;
      if (error) {
        toast.error(error);
        return;
      }
      router.push(data.url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="mt-4 w-full cursor-pointer"
      onClick={handleCheckout}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Purchasing...
        </div>
      ) : (
        "Purchase"
      )}
    </Button>
  );
};

export default Checkout;
