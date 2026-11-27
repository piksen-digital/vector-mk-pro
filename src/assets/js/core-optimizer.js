/**
 * VectorForge Precision Engine - High-Performance SVG Parsing & Re-parametrization
 */
export class VectorCoreOptimizer {
    constructor() {
        this.parser = new DOMParser();
    }

    /**
     * Parses and minifies native path geometry strings safely
     * @param {string} svgContent RAW SVG string structure
     * @param {object} settings Custom adjustment configuration presets
     */
    optimize(svgContent, settings) {
        const doc = this.parser.parseFromString(svgContent, 'image/svg+xml');
        const paths = doc.querySelectorAll('path');
        let totalNodesCount = 0;

        paths.forEach(path => {
            const rawD = path.getAttribute('d');
            if (!rawD) return;

            // Step 1: Tokenize and isolate individual spatial instructions
            const commands = this.parsePathData(rawD);
            totalNodesCount += commands.length;

            // Step 2: Apply precision constraints and structural path manipulation
            const optimizedCommands = commands.map(cmd => {
                const roundedCoords = cmd.coords.map(num => {
                    return parseFloat(num.toFixed(settings.decimalPrecision));
                });
                return { type: cmd.type, coords: roundedCoords };
            });

            // Step 3: Format compiled commands back into minified string format
            const outputD = optimizedCommands.map(cmd => {
                return `${cmd.type}${cmd.coords.join(',')}`;
            }).join(' ').replace(/\s+/g, ' ').trim();

            path.setAttribute('d', outputD);
        });

        const serializer = new XMLSerializer();
        return {
            cleanSVG: serializer.serializeToString(doc),
            nodeCount: totalNodesCount
        };
    }

    /**
     * Highly stable RegEx-based SVG Path tokenizer module
     */
    parsePathData(d) {
        const commandRegex = /([achlmqstvz])([^achlmqstvz]*)/gi;
        const matches = d.matchAll(commandRegex);
        const tokens = [];

        for (const match of matches) {
            const type = match[1];
            const coordString = match[2].trim();
            const coords = coordString ? coordString.split(/[\s,递\-]+|(?=\-)/).filter(Boolean).map(Number) : [];
            tokens.push({ type, coords });
        }
        return tokens;
    }
}
