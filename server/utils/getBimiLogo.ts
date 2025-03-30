import consola from "consola";
import { promises as dns } from "node:dns";
import { tryCatch } from "#shared/utils/try-catch";
import type { Result } from "#shared/types/try-catch";

/**
 * Fetches the BIMI logo URL from the DNS TXT record for a given domain.
 * @param domain The sender domain (e.g., "example.com").
 * @param selector The BIMI selector (default is "default").
 * @returns The URL of the BIMI logo (SVG) or null if not found or invalid.
 */
export async function getBimiLogoUrl(
  domain: string,
  selector: string = "default"
): Promise<Result<string | null, Error>> {
  if (!domain) {
    return { error: new TypeError("Domain is required"), data: null };
  }

  const bimiRecordName = `${selector}._bimi.${domain}`;

  const { data: txtRecords, error } = await tryCatch(dns.resolveTxt(bimiRecordName));

  // ENODATA エラーは正常系として扱う（多くのドメインはBIMIレコードを持っていない）
  if (error) {
    // Node.jsのDNSエラーには code プロパティがある
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENODATA' || nodeError.code === 'ENOTFOUND') {
      consola.debug(`No BIMI DNS record found for ${domain} (selector: ${selector}): ${nodeError.code}`);
      return { error: null, data: null };
    }
    return { error, data: null };
  }

  if (!txtRecords || txtRecords.length === 0) {
    return { error: null, data: null };
  }

  // TXT records can be arrays of strings, potentially split.
  // We need to find the one starting with "v=BIMI1"
  for (const recordParts of txtRecords) {
    const record = recordParts.join(""); // Join parts if split
    if (record.startsWith("v=BIMI1")) {
      // Simple parsing for the l= tag
      const locationMatch = record.match(/l=([^;\s]+)/);
      if (locationMatch && locationMatch[1]) {
        // Basic validation: should be https
        if (locationMatch[1].startsWith("https://")) {
          consola.debug(`BIMI logo found for ${domain}: ${locationMatch[1]}`);
          return { error: null, data: locationMatch[1] };
        }
        consola.warn(
          `Invalid BIMI logo URL found for ${domain}: ${locationMatch[1]} (must be HTTPS)`
        );
      }
      // Found the BIMI record but no valid l= tag
      consola.debug(
        `BIMI record found for ${domain}, but no valid logo URL (l= tag).`
      );
      return { error: null, data: null };
    }
  }
  // No TXT record starting with v=BIMI1 found
  consola.debug(`No BIMI record found for ${domain} at ${bimiRecordName}`);
  return { error: null, data: null };
}
