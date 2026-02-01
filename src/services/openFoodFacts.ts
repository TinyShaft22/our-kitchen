/**
 * Open Food Facts API Integration
 * Free API - no key required, just a User-Agent header
 * https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

export interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  image_front_small_url?: string;
  image_front_url?: string;
  categories_tags?: string[];
  status: number;
}

export interface OFFResponse {
  code: string;
  status: number;
  status_verbose: string;
  product?: OFFProduct;
}

export interface ProductLookupResult {
  found: boolean;
  barcode: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
}

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'OurKitchen/1.0 (contact@example.com)';

/**
 * Look up a product by barcode from Open Food Facts
 */
export async function lookupBarcode(barcode: string): Promise<ProductLookupResult> {
  try {
    const response = await fetch(
      `${OFF_API_BASE}/product/${barcode}?fields=code,product_name,brands,image_url,image_front_small_url,image_front_url`,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      return { found: false, barcode };
    }

    const data: OFFResponse = await response.json();

    if (data.status !== 1 || !data.product) {
      return { found: false, barcode };
    }

    const product = data.product;

    // Prefer smaller image for performance, fall back to larger ones
    const imageUrl = product.image_front_small_url
      || product.image_front_url
      || product.image_url;

    return {
      found: true,
      barcode,
      name: product.product_name || undefined,
      brand: product.brands || undefined,
      imageUrl: imageUrl || undefined,
    };
  } catch (err) {
    console.error('Error looking up barcode:', err);
    return { found: false, barcode };
  }
}

/**
 * Contribute a product to Open Food Facts via their simple write API.
 * No OAuth required for basic product name/brand contributions.
 * https://openfoodfacts.github.io/openfoodfacts-server/api/
 */
export async function contributeProduct(
  barcode: string,
  name: string,
  brand?: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('code', barcode);
    params.append('product_name', name);
    if (brand) {
      params.append('brands', brand);
    }
    params.append('user_id', 'our-kitchen-app');
    params.append('password', 'our-kitchen-app');
    params.append('comment', 'Contributed via Our Kitchen app');

    const response = await fetch(
      'https://world.openfoodfacts.org/cgi/product_jqm2.pl',
      {
        method: 'POST',
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      console.error('OFF contribution failed:', response.status);
      return false;
    }

    const data = await response.json();
    return data.status === 1;
  } catch (err) {
    console.error('Error contributing to OFF:', err);
    return false;
  }
}
