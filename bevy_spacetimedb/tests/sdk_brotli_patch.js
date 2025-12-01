/**
 * Patch for SpacetimeDB SDK to add Brotli decompression support
 * Uses browser's native DecompressionStream API
 */

// Add Brotli decompression using browser DecompressionStream API
export async function decompressBrotli(buffer) {
    const stream = new Response(buffer).body
        .pipeThrough(new DecompressionStream('deflate-raw')); // Brotli = 'deflate-raw' in browsers

    const decompressed = await new Response(stream).arrayBuffer();
    return new Uint8Array(decompressed);
}

// Alternative: use 'br' if supported
export async function decompressBrotliAlt(buffer) {
    try {
        const stream = new Response(buffer).body
            .pipeThrough(new DecompressionStream('br'));

        const decompressed = await new Response(stream).arrayBuffer();
        return new Uint8Array(decompressed);
    } catch (e) {
        console.error('Brotli decompression failed:', e);
        throw new Error('Brotli decompression not supported by browser');
    }
}
