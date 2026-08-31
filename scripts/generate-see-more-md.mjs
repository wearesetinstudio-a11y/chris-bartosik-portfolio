import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const data = JSON.parse(fs.readFileSync('scripts/see-more-full.json', 'utf-8'));

const frontmatter = {
  title: 'See More Logistics',
  client: 'See More Logistics',
  tags: ['branding', 'ux-ui', 'webflow'],
  categories: ['branding', 'ux-ui', 'development'],
  thumbnail: '/portfolio/see-more/cover.riv',
  folderName: 'see-more',
  order: 3,
  comingSoon: false,
  video: '/portfolio/see-more/cover.riv',
  heroImage: '/portfolio/see-more/bg.webp',
  logo: '/logos/see-more.svg',
  clientLabel: 'Client',
  heroSubtitle: data.heroSubtitle.en,
  service: data.service.en,
  industry: data.industry.en,
  market: data.market.en,
  tools: data.tools.en,
  year: 2026,
  liveLabel: data.liveLabel.en || 'seemorelogistics',
  liveUrl: data.liveUrl.en || 'https://seemore-logistics.webflow.io',
  overviewLabel: data.overviewLabel.en || 'Intro',
  overviewTitle: data.overviewTitle.en,
  overviewText: data.overviewText.en,
  sections: [
    {
      label: data['sections.0.label'].en,
      title: data['sections.0.title'].en,
      text: data['sections.0.text'].en,
      afterGroup: 2,
    },
    {
      label: data['sections.1.label'].en,
      title: data['sections.1.title'].en,
      text: data['sections.1.text'].en,
      afterGroup: 4,
    },
    {
      label: data['sections.2.label'].en,
      title: data['sections.2.title'].en,
      text: data['sections.2.text'].en,
      afterGroup: 7,
    },
    {
      label: data['sections.9.label'].en,
      title: data['sections.9.title'].en,
      text: data['sections.9.text'].en,
    },
  ],
  i18n: {
    pl: {
      title: 'See More Logistics',
      clientLabel: data.clientLabel.pl || 'Klient',
      category: data.category.pl || 'branding, ux-ui, webflow',
      heroSubtitle: data.heroSubtitle.pl,
      service: data.service.pl,
      industry: data.industry.pl,
      market: data.market.pl,
      tools: data.tools.en,
      liveLabel: data.liveLabel.en || 'seemorelogistics',
      overviewLabel: data.overviewLabel.pl || 'Intro',
      overviewTitle: data.overviewTitle.pl,
      overviewText: data.overviewText.pl,
      sections: [
        {
          label: data['sections.0.label'].pl,
          title: data['sections.0.title'].pl,
          text: data['sections.0.text'].pl,
        },
        {
          label: data['sections.1.label'].pl,
          title: data['sections.1.title'].pl,
          text: data['sections.1.text'].pl,
        },
        {
          label: data['sections.2.label'].pl,
          title: data['sections.2.title'].pl,
          text: data['sections.2.text'].pl,
        },
        {
          label: data['sections.9.label'].pl,
          title: data['sections.9.title'].pl,
          text: data['sections.9.text'].pl,
        },
      ],
    },
    pa: {
      title: 'See More Logistics',
      clientLabel: data.clientLabel.es || 'Cliente',
      category: data.category.es || 'branding, ux-ui, webflow',
      heroSubtitle: data.heroSubtitle.es,
      service: data.service.es,
      industry: data.industry.es,
      market: data.market.es,
      tools: data.tools.en,
      liveLabel: data.liveLabel.en || 'seemorelogistics',
      overviewLabel: data.overviewLabel.es || 'Intro',
      overviewTitle: data.overviewTitle.es,
      overviewText: data.overviewText.es,
      sections: [
        {
          label: data['sections.0.label'].es,
          title: data['sections.0.title'].es,
          text: data['sections.0.text'].es,
        },
        {
          label: data['sections.1.label'].es,
          title: data['sections.1.title'].es,
          text: data['sections.1.text'].es,
        },
        {
          label: data['sections.2.label'].es,
          title: data['sections.2.title'].es,
          text: data['sections.2.text'].es,
        },
        {
          label: data['sections.9.label'].es,
          title: data['sections.9.title'].es,
          text: data['sections.9.text'].es,
        },
      ],
    },
  },
};

const yamlContent = `---\n${yaml.stringify(frontmatter)}---\n`;
fs.writeFileSync('src/content/projects/see-more.md', yamlContent, 'utf-8');
console.log('Successfully generated src/content/projects/see-more.md');
