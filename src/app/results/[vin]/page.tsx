import React from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { unstable_cache } from "next/cache";
import getVinData from "@/utils/getVinData";
import getCarImage from "@/utils/getCarImage";
import VinLookupTable from "@/components/vin-lookup-table";
import VehicleRecalls from "@/components/vehicle-recalls";

type Props = {
  params: Promise<{ vin: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { vin } = await params;
  const getCachedVinData = unstable_cache(
    async (vin) => getVinData(vin),
    [`vin-${vin}`]
  );

  const vehicle = await getCachedVinData(vin);

  const imageUrl = getCarImage(
    {
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      year: vehicle.year ?? "",
    },
    "0"
  );

  if (vehicle.error) {
    return {
      title: "Error - VIN Decode",
      description: "Error fetching VIN data. Please try again later.",
      openGraph: {
        title: "Error - VIN Decode",
        description: "Error fetching VIN data. Please try again later.",
      },
    };
  }

  return {
    title: `Vin Decoder - ${vin}`,
    description: `Detailed information for VIN ${vin}. Learn about the ${vehicle.make} ${vehicle.model} on vin-decode.com.`,
    openGraph: {
      title: `${vehicle.make} ${vehicle.model} - VIN Decoder`,
      description: `Detailed information for VIN ${vin}. Learn about the ${vehicle.make} ${vehicle.model} on vin-decode.com.`,
      url: `https://vin-decode.com/results/${vin}`,
      images: [imageUrl],
    },
  };
}

async function VinResult({ params }: Props) {
  const { vin } = await params;
  const getCachedVinData = unstable_cache(
    async (vin) => getVinData(vin),
    [`vin-${vin}`]
  );

  const data = await getCachedVinData(vin);
  const imageUrl = getCarImage(
    { make: data.make ?? "", model: data.model ?? "", year: data.year ?? "" },
    "0"
  );

  if (data.error) {
    return (
      <div className="min-h-screen dark:bg-neutral-900 p-6 md:p-10 flex items-center justify-center mt-16">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error fetching VIN data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="dark:bg-neutral-900 p-6 md:p-10 mt-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-8 text-center">
          VIN Lookup Results for {data.year} {data.make} {data.model}
        </h1>
        {imageUrl && (
          <section aria-labelledby="vehicle-image-heading">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={`${data.year} ${data.make} ${data.model}`}
                fill
                className="transition-opacity duration-300 hover:opacity-90 object-contain"
                priority
              />
            </div>
          </section>
        )}
        <section className="text-center text-gray-600 dark:text-neutral-400 mb-3.5">
          <p>VIN: {vin}</p>
        </section>
        <section
          className="rounded-lg overflow-hidden mb-10"
          aria-labelledby="vehicle-details-heading"
        >
          <h2 id="vehicle-details-heading" className="sr-only">
            Vehicle Details
          </h2>
          <VinLookupTable vinData={data} />
        </section>
        <VehicleRecalls recalls={data.recalls} />
      </div>
    </div>
  );
}

export default VinResult;
