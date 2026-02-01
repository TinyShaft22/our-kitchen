import { Button } from '@/components/ui/button';

interface ProductLookupResultProps {
  result: {
    found: boolean;
    barcode: string;
    name?: string;
    brand?: string;
    imageUrl?: string;
    source: 'cache' | 'off' | 'none' | 'global';
  };
  onUse: () => void;
  onTryAgain: () => void;
  onManualEntry: () => void;
}

export function ProductLookupResult({
  result,
  onUse,
  onTryAgain,
  onManualEntry,
}: ProductLookupResultProps) {
  if (!result.found) {
    return (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-charcoal/10 flex items-center justify-center">
          <span className="text-4xl">❓</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-charcoal">Product Not Found</h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Barcode: <span className="font-mono">{result.barcode}</span>
          </p>
        </div>
        <p className="text-sm text-charcoal/60">
          We couldn't find this product in our database. You can enter the details manually.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onManualEntry}
            className="w-full h-11 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90"
          >
            Enter Details Manually
          </Button>
          <Button
            variant="outline"
            onClick={onTryAgain}
            className="w-full h-11 rounded-soft border-charcoal/20 text-charcoal"
          >
            Scan Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Product Image */}
      {result.imageUrl ? (
        <img
          src={result.imageUrl}
          alt={result.name || 'Product'}
          className="w-full max-h-48 object-contain rounded-soft bg-white"
        />
      ) : (
        <div className="w-full h-32 rounded-soft bg-sage/20 flex items-center justify-center">
          <span className="text-5xl opacity-40">🍿</span>
        </div>
      )}

      {/* Product Info */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-charcoal">
          {result.name || 'Unknown Product'}
        </h3>
        {result.brand && (
          <p className="text-charcoal/60 mt-1">{result.brand}</p>
        )}
        <p className="text-xs text-charcoal/40 font-mono mt-2">
          {result.barcode}
        </p>
      </div>

      {/* Source Badge */}
      <div className="flex justify-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          result.source === 'cache'
            ? 'bg-sage/20 text-sage'
            : 'bg-honey/20 text-honey'
        }`}>
          {result.source === 'cache' ? 'From your library' : 'From Open Food Facts'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={onUse}
          className="w-full h-11 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90"
        >
          Add to Snacks
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onManualEntry}
            className="flex-1 h-10 rounded-soft border-charcoal/20 text-charcoal text-sm"
          >
            Edit Details
          </Button>
          <Button
            variant="outline"
            onClick={onTryAgain}
            className="flex-1 h-10 rounded-soft border-charcoal/20 text-charcoal text-sm"
          >
            Scan Again
          </Button>
        </div>
      </div>
    </div>
  );
}
