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
                const expertText = assistantMsg.content.length > 1500
                    ? assistantMsg.content.substring(0, 1500) + '... [TRUNCATED]'
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

async function fetchClinicalLiterature(query, specialtyId) {
    try {
        let categoryFilter = specialtyId ? ` AND (${specialtyId})` : '';
        let evidenceFilter = '(PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Practice Guideline")';

        // 1. Europe PMC (Aggregates PubMed, PMC, Guidelines)
        const fetchPMC = async (sortMode) => {
            try {
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
                    source: 'Europe PMC / PubMed',
                    title: r.title,
                    journal: r.journalTitle || r.pubType || 'Medical Journal',
                    year: r.pubYear,
                    abstract: r.abstractText ? r.abstractText.replace(/<\/?(?:b|i|p|sup|sub)>/g, '') : '',
                    type: sortMode.includes('sort_date') ? 'Latest Research' : 'Highly Cited Foundation'
                })).filter(r => r.abstract);
            } catch { return []; }
        };

        // 2. ClinicalTrials.gov (Latest ongoing/completed trials)
        const fetchTrials = async () => {
            try {
                const url = new URL('https://clinicaltrials.gov/api/v2/studies');
                url.searchParams.append('query.cond', query);
                url.searchParams.append('pageSize', '2');
                url.searchParams.append('sort', 'LastUpdatePostDate:desc'); // Get latest
                
                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const studies = data.studies || [];
                
                return studies.map(s => {
                    const protocol = s.protocolSection || {};
                    return {
                        source: 'ClinicalTrials.gov',
                        title: protocol.identificationModule?.briefTitle || 'Clinical Trial',
                        journal: 'ClinicalTrials Registry',
                        year: protocol.statusModule?.lastUpdateSubmitDate?.split('-')[0] || 'Recent',
                        abstract: protocol.descriptionModule?.briefSummary || 'Clinical trial investigating the condition or intervention.',
                        type: 'Clinical Trial / Experimental'
                    };
                });
            } catch { return []; }
        };

        // 3. OpenFDA (Drug labels, warnings)
        const fetchFDA = async () => {
            try {
                // We use generic search across indications and generic names
                const url = new URL('https://api.fda.gov/drug/label.json');
                url.searchParams.append('search', `indications_and_usage:"${query}" OR generic_name:"${query}"`);
                url.searchParams.append('limit', '1');
                
                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const results = data.results || [];
                
                return results.map(r => ({
                    source: 'OpenFDA (FDA.gov)',
                    title: `FDA Label: ${r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || 'Drug'}`,
                    journal: 'FDA Official Labeling',
                    year: r.effective_time?.substring(0,4) || 'Current',
                    abstract: `INDICATIONS: ${r.indications_and_usage?.[0] || 'N/A'}\nWARNINGS: ${r.boxed_warning?.[0] || r.warnings?.[0] || 'No boxed warnings.'}`,
                    type: 'Official FDA Data'
                }));
            } catch { return []; }
        };

        const [pmcLatest, pmcCited, trials, fda] = await Promise.all([
            fetchPMC('sort_date:y'),
            fetchPMC('sort_cited:y'),
            fetchTrials(),
            fetchFDA()
        ]);

        const allRefs = [...pmcCited, ...pmcLatest, ...trials, ...fda];
        return allRefs.slice(0, 5); // Limit total context size to prevent overloading LLM
    } catch {
        return [];
    }
}

module.exports = {
    fetchMedicalKnowledge,
    fetchClinicalLiterature,
};
