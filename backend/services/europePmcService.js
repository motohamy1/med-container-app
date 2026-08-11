async function fetchMedicalKnowledge(query) {
    try {
        const url = new URL('https://datasets-server.huggingface.co/search');
        url.searchParams.append('dataset', 'OpenMed/Medical-Reasoning-SFT-Mega');
        url.searchParams.append('config', 'default');
        url.searchParams.append('split', 'train');
        url.searchParams.append('query', query);

        const response = await fetch(url.toString());
        if (!response.ok) return '';

        const data = await response.json();
        if (data.error || !data.rows?.length) return '';

        let context = '';
        data.rows.slice(0, 2).forEach((rowItem, index) => {
            const messages = rowItem.row.messages || [];
            const userMsg = messages.find((m) => m.role === 'user');
            const assistantMsg = messages.find((m) => m.role === 'assistant');
            if (userMsg && assistantMsg) {
                const expertText = assistantMsg.content.length > 2000
                    ? assistantMsg.content.substring(0, 2000) + '... [TRUNCATED]'
                    : assistantMsg.content;

                context += `--- CLINICAL RESOURCE REFERENCE ${index + 1} ---\n`;
                context += `Clinical Query: ${userMsg.content}\n`;
                context += `Expert Medical Synthesis: ${expertText}\n`;
                context += `------------------\n\n`;
            }
        });
        return context;
    } catch {
        return '';
    }
}

async function fetchEuropePMC(query, specialtyId) {
    try {
        // Fallback or lightweight mapping for standard specialty codes if desired,
        // though since the DB drives this, we just ensure a good base query.
        let categoryFilter = '';
        if (specialtyId) {
            categoryFilter = ` AND (${specialtyId})`;
        }
        
        let evidenceFilter = '(PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Practice Guideline")';

        const fetchRefs = async (sortMode) => {
            const enhancedQuery = `(${query})${categoryFilter} AND ${evidenceFilter} ${sortMode}`;
            const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
            url.searchParams.append('query', enhancedQuery);
            url.searchParams.append('format', 'json');
            url.searchParams.append('resultType', 'core');
            url.searchParams.append('pageSize', '2'); 
            
            const response = await fetch(url.toString());
            if (!response.ok) return [];
            const data = await response.json();
            const results = data.resultList?.result || [];
            
            return results.map(r => ({
                id: r.pmid || r.id,
                title: r.title,
                author: r.authorString || 'Unknown Authors',
                journal: r.journalTitle || r.pubType || 'Medical Journal',
                year: r.pubYear,
                abstract: r.abstractText ? r.abstractText.replace(/<\/?(?:b|i|p|sup|sub)>/g, '') : '',
                url: `https://europepmc.org/article/MED/${r.pmid || r.id}`,
                type: sortMode.includes('sort_date') ? 'Latest Update' : 'Highly Cited Foundation'
            })).filter(r => r.abstract);
        };

        const [latestRefs, citedRefs] = await Promise.all([
            fetchRefs('sort_date:y'),
            fetchRefs('sort_cited:y')
        ]);

        const allRefs = [...citedRefs, ...latestRefs];
        const uniqueRefs = [];
        const seenIds = new Set();
        for (const ref of allRefs) {
            if (!seenIds.has(ref.id)) {
                seenIds.add(ref.id);
                uniqueRefs.push(ref);
            }
        }
        return uniqueRefs.slice(0, 4);
    } catch {
        return [];
    }
}

module.exports = {
    fetchMedicalKnowledge,
    fetchEuropePMC,
};
