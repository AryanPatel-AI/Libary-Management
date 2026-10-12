import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Feather, BookOpen, Quote, Sparkles, Filter,
  ArrowRight, X, Calendar, MapPin, Award, Bookmark,
  Layers, ChevronRight, ExternalLink, Library
} from 'lucide-react';

const authorsData = [
  {
    id: 'ada-lovelace',
    name: 'Ada Lovelace',
    honorific: 'Countess of Lovelace',
    lifespan: '1815 – 1852',
    era: 'Victorian Era & Industrial Dawn',
    movement: 'Computing Pioneers',
    nationality: 'British',
    genres: ['Theoretical Computing', 'Mathematics', 'Poetical Science'],
    portrait: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    quote: 'The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.',
    bio: 'Augusta Ada King, Countess of Lovelace was an English mathematician and writer, chiefly known for her work on Charles Babbage’s mechanical general-purpose computer, the Analytical Engine. She was the first to recognize that the machine had applications beyond pure calculation, authoring the first algorithm intended to be carried out by such a machine.',
    extendedBio: 'Lovelace called her approach "poetical science" and herself an "Analyst (& Metaphysician)". As a young adult, her mathematical talents led her to an ongoing working relationship and friendship with British mathematician Charles Babbage, whom she called "the man of the analytical engine". Between 1842 and 1843, she translated an article by Italian military engineer Luigi Menabrea about the Engine, supplementing it with an elaborate set of notes, simply called "Notes", which contain what many consider to be the first computer program.',
    notableWorks: [
      { title: 'Sketch of the Analytical Engine (Notes G)', year: '1843', callNumber: 'DEWEY 004.092', medium: 'Annotated Translation' },
      { title: 'Correspondence on the Bernouilli Numbers', year: '1842', callNumber: 'VAULT-COMP-01', medium: 'Manuscript' },
      { title: 'Essays on Poetical Science & Calculation', year: '1851', callNumber: 'DEWEY 510.1', medium: 'Monograph' }
    ],
    milestones: [
      { year: '1833', event: 'Met Charles Babbage through mutual tutor Mary Somerville.' },
      { year: '1843', event: 'Published the groundbreaking "Note G", formulating the first computer algorithm.' },
      { year: '1980', event: 'US Department of Defense names military computing language "Ada" in her honor.' }
    ],
    archivalHoldings: 9,
    rarities: ['1843 Richard Taylor Scientific Memoirs reprint', 'Babbage-Lovelace epistolary facsimile portfolio'],
    accentColor: '#d97706'
  },
  {
    id: 'alan-turing',
    name: 'Alan Turing',
    honorific: 'OBE FRS',
    lifespan: '1912 – 1954',
    era: 'Mid-20th Century & Information Dawn',
    movement: 'Computing Pioneers',
    nationality: 'British',
    genres: ['Theoretical Computing', 'Mathematical Logic', 'Cryptanalysis', 'Artificial Intelligence'],
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    quote: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    bio: 'Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine.',
    extendedBio: 'During the Second World War, Turing was a leading participant in war-time codebreaking at Bletchley Park. His Bombe machine broke the Enigma enciphered ciphers used by German armed forces. In 1950, he published his seminal paper "Computing Machinery and Intelligence", introducing the famous imitation game known today as the Turing Test.',
    notableWorks: [
      { title: 'On Computable Numbers, with an Application to the Entscheidungsproblem', year: '1936', callNumber: 'VAULT-004-T', medium: 'Proceedings of LMS' },
      { title: 'Computing Machinery and Intelligence', year: '1950', callNumber: 'DEWEY 006.3', medium: 'Mind Journal Offprint' },
      { title: 'The Chemical Basis of Morphogenesis', year: '1952', callNumber: 'DEWEY 571.8', medium: 'Philosophical Transactions' }
    ],
    milestones: [
      { year: '1936', event: 'Introduced the universal Turing machine model of computation.' },
      { year: '1940', event: 'Designed the electro-mechanical Bombe deciphering axis naval transmissions.' },
      { year: '1950', event: 'Proposed the Turing Test for machine intelligence.' }
    ],
    archivalHoldings: 14,
    rarities: ['1936 offprint from King’s College Archives', 'Original Bletchley Park debrief manual copy'],
    accentColor: '#2563eb'
  },
  {
    id: 'virginia-woolf',
    name: 'Virginia Woolf',
    honorific: 'Literary Pioneer',
    lifespan: '1882 – 1941',
    era: 'Modernism & Interwar Era',
    movement: 'Modernism',
    nationality: 'British',
    genres: ['Modernist Fiction', 'Feminist Criticism', 'Essays', 'Epistolary'],
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    quote: 'Lock up your libraries if you like; but there is no gate, no lock, no bolt that you can set upon the freedom of my mind.',
    bio: 'Adeline Virginia Woolf was an English writer, considered one of the most important modernist 20th-century authors and a pioneer in the use of stream of consciousness as a narrative device. Founding member of the Bloomsbury Group and co-founder of the Hogarth Press.',
    extendedBio: 'Woolf began writing professionally in 1900. During the interwar period, Woolf was an important part of London literary society and a central figure in the Bloomsbury Group of intellectuals. Her works include novels such as Mrs Dalloway (1925), To the Lighthouse (1927), and Orlando (1928), alongside major essays like A Room of One\'s Own (1929).',
    notableWorks: [
      { title: 'Mrs Dalloway', year: '1925', callNumber: 'DEWEY 823.912', medium: 'First Edition Hogarth' },
      { title: 'To the Lighthouse', year: '1927', callNumber: 'DEWEY 823.912', medium: 'First Edition' },
      { title: 'A Room of One’s Own', year: '1929', callNumber: 'DEWEY 809.892', medium: 'Essay Monograph' }
    ],
    milestones: [
      { year: '1917', event: 'Founded the Hogarth Press with Leonard Woolf, hand-printing seminal works.' },
      { year: '1925', event: 'Published Mrs Dalloway, reinventing modernist narrative perspective.' },
      { year: '1929', event: 'Delivered lectures at Newnham and Girton Colleges resulting in A Room of One\'s Own.' }
    ],
    archivalHoldings: 18,
    rarities: ['1927 Hogarth Press limited run with dust jacket illustrated by Vanessa Bell', 'Hand-typeset proof of The Waves'],
    accentColor: '#9333ea'
  },
  {
    id: 'jorge-luis-borges',
    name: 'Jorge Luis Borges',
    honorific: 'Director of the National Library',
    lifespan: '1899 – 1986',
    era: '20th Century Postmodern & Metaphysical',
    movement: 'Postmodern & Metaphysical',
    nationality: 'Argentine',
    genres: ['Philosophical Fiction', 'Labyrinthine Studies', 'Poetry', 'Essays'],
    portrait: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    quote: 'I have always imagined that Paradise will be a kind of library.',
    bio: 'Jorge Francisco Isidoro Luis Borges Acevedo was an Argentine short-story writer, essayist, poet and translator, and a key figure in Spanish-language and international literature. His best-known books, Ficciones and El Aleph, are compilations of short stories interconnected by common themes including dreams, labyrinths, mirrors, and infinite libraries.',
    extendedBio: 'In 1955 Borges was appointed Director of the National Library of Argentina and Professor of English Literature at the University of Buenos Aires. By this time, hereditary blindness had set in, leading him to rely on his mother and collaborators to dictate his brilliant labyrinthine tales.',
    notableWorks: [
      { title: 'Ficciones (The Library of Babel)', year: '1944', callNumber: 'DEWEY 863.62', medium: 'Anthology' },
      { title: 'The Aleph and Other Stories', year: '1949', callNumber: 'DEWEY 863.62', medium: 'Short Fiction' },
      { title: 'Other Inquisitions (Otras inquisiciones)', year: '1952', callNumber: 'DEWEY 864.62', medium: 'Philosophical Essays' }
    ],
    milestones: [
      { year: '1941', event: 'Published "The Garden of Forking Paths", anticipating hypertext and quantum multiverses.' },
      { year: '1955', event: 'Appointed Director of the National Public Library of the Argentine Republic.' },
      { year: '1961', event: 'Awarded the inaugural Prix International alongside Samuel Beckett.' }
    ],
    archivalHoldings: 12,
    rarities: ['1944 Sur First Edition of Ficciones', 'Signed bibliographic correspondence from Buenos Aires'],
    accentColor: '#059669'
  },
  {
    id: 'sir-isaac-newton',
    name: 'Sir Isaac Newton',
    honorific: 'PRS MP',
    lifespan: '1643 – 1727',
    era: 'The Scientific Revolution & Enlightenment',
    movement: 'Enlightenment',
    nationality: 'English',
    genres: ['Natural Philosophy', 'Optics', 'Classical Mechanics', 'Mathematics'],
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    quote: 'If I have seen further it is by standing on the shoulders of Giants.',
    bio: 'Sir Isaac Newton was an English polymath active as a mathematician, physicist, astronomer, alchemist, theologian, and author. His book Philosophiæ Naturalis Principia Mathematica, first published in 1687, established classical mechanics and formulated the laws of motion and universal gravitation.',
    extendedBio: 'Newton also made seminal contributions to optics and shares credit with Gottfried Wilhelm Leibniz for developing the infinitesimal calculus. Newton built the first practical reflecting telescope and developed a sophisticated theory of color based on the observation that a prism decomposes white light into the visible spectrum.',
    notableWorks: [
      { title: 'Philosophiæ Naturalis Principia Mathematica', year: '1687', callNumber: 'VAULT-01-NEWT', medium: 'First Folio Edition' },
      { title: 'Opticks: Or, a Treatise of the Reflections', year: '1704', callNumber: 'VAULT-OPT-02', medium: 'Monograph' },
      { title: 'Method of Fluxions', year: '1736', callNumber: 'DEWEY 515.09', medium: 'Posthumous Mathematical Treatise' }
    ],
    milestones: [
      { year: '1666', event: 'Annus Mirabilis: developed calculus, optics, and gravitation laws at Woolsthorpe.' },
      { year: '1687', event: 'Published Principia Mathematica under the encouragement of Edmond Halley.' },
      { year: '1703', event: 'Elected President of the Royal Society, serving until his passing.' }
    ],
    archivalHoldings: 7,
    rarities: ['1687 Principia Mathematica First Edition (Sam. Smith imprint)', '1704 Opticks with foldout geometric copperplates'],
    accentColor: '#ea580c'
  },
  {
    id: 'mary-shelley',
    name: 'Mary Wollstonecraft Shelley',
    honorific: 'Master of Speculative Romanticism',
    lifespan: '1797 – 1851',
    era: 'Romanticism & The Gothic Movement',
    movement: 'Romanticism',
    nationality: 'British',
    genres: ['Gothic Fiction', 'Speculative Fiction', 'Travel Literature', 'Biographical Essays'],
    portrait: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    quote: 'Invention, it must be humbly admitted, does not consist in creating out of void, but out of chaos.',
    bio: 'Mary Wollstonecraft Shelley was an English novelist who wrote the Gothic novel Frankenstein; or, The Modern Prometheus (1818), which is considered an early and foundational example of science fiction. She also edited and promoted the works of her husband, the Romantic poet and philosopher Percy Bysshe Shelley.',
    extendedBio: 'Daughter of political philosopher William Godwin and pioneering feminist philosopher Mary Wollstonecraft. During the famous wet summer of 1816 at the Villa Diodati near Lake Geneva with Lord Byron and Percy Shelley, the group held a competition to see who could write the best horror story, planting the seed for Frankenstein.',
    notableWorks: [
      { title: 'Frankenstein; or, The Modern Prometheus', year: '1818', callNumber: 'DEWEY 823.7', medium: 'Three-Volume First Edition' },
      { title: 'The Last Man', year: '1826', callNumber: 'DEWEY 823.7', medium: 'Speculative Apocalyptic Novel' },
      { title: 'Valperga: Or, the Life and Adventures of Castruccio', year: '1823', callNumber: 'DEWEY 823.7', medium: 'Historical Romance' }
    ],
    milestones: [
      { year: '1816', event: 'Conceived Frankenstein at Villa Diodati alongside Byron and Percy Shelley.' },
      { year: '1818', event: 'Published Frankenstein anonymously in a limited run of 500 copies.' },
      { year: '1826', event: 'Published The Last Man, laying the groundwork for modern speculative fiction.' }
    ],
    archivalHoldings: 11,
    rarities: ['1818 Lackington Hughes 3-volume set', '1831 Revised Bentley Standard Novels edition with frontispiece'],
    accentColor: '#db2777'
  },
  {
    id: 'donald-knuth',
    name: 'Donald E. Knuth',
    honorific: 'Professor Emeritus at Stanford',
    lifespan: 'b. 1938',
    era: 'Contemporary Digital Age & Algorithmic Era',
    movement: 'Computing Pioneers',
    nationality: 'American',
    genres: ['Algorithmic Theory', 'Typography', 'Discrete Mathematics', 'Literate Programming'],
    portrait: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    quote: 'Science is what we understand well enough to explain to a computer. Art is everything else we do.',
    bio: 'Donald Ervin Knuth is an American computer scientist, mathematician, and professor emeritus at Stanford University. He is the author of the multi-volume work The Art of Computer Programming. He contributed to the development of rigorous analysis of computational complexity of algorithms and systematized formal mathematical techniques for it.',
    extendedBio: 'In addition to fundamental contributions in theoretical computer science, Knuth created the TeX computer typesetting system, the related METAFONT font definition language and rendering system, and the WEB and CWEB computer programming systems for literate programming.',
    notableWorks: [
      { title: 'The Art of Computer Programming (Vols 1–4B)', year: '1968–Present', callNumber: 'DEWEY 005.1', medium: 'Multi-Volume Treatise' },
      { title: 'The TeXbook & METAFONT', year: '1984', callNumber: 'DEWEY 005.52', medium: 'Typography Reference' },
      { title: 'Concrete Mathematics', year: '1989', callNumber: 'DEWEY 510', medium: 'Textbook' }
    ],
    milestones: [
      { year: '1968', event: 'Published Volume 1 of The Art of Computer Programming.' },
      { year: '1974', event: 'Awarded the ACM A.M. Turing Award for foundational contributions.' },
      { year: '1978', event: 'Created TeX to achieve perfection in mathematical typesetting.' }
    ],
    archivalHoldings: 16,
    rarities: ['1968 Addison-Wesley First Printing Volume 1', 'Signed original TeX source code documentation booklet'],
    accentColor: '#0284c7'
  },
  {
    id: 'gabriel-garcia-marquez',
    name: 'Gabriel García Márquez',
    honorific: 'Nobel Laureate in Literature',
    lifespan: '1927 – 2014',
    era: 'Boom Latinoamericano & 20th Century',
    movement: 'Postmodern & Metaphysical',
    nationality: 'Colombian',
    genres: ['Magical Realism', 'Journalism', 'Epic Fiction', 'Memoir'],
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    quote: 'What matters in life is not what happens to you, but what you remember and how you remember it.',
    bio: 'Gabriel García Márquez was a Colombian novelist, short-story writer, screenwriter, and journalist, known affectionately as Gabo throughout Latin America. Considered one of the most significant authors of the 20th century, particularly in the Spanish language, he was awarded the 1982 Nobel Prize in Literature.',
    extendedBio: 'García Márquez started as a journalist and wrote many acclaimed non-fiction works and short stories, but is best known for his novels, such as One Hundred Years of Solitude (1967), The Autumn of the Patriarch (1975), and Love in the Time of Cholera (1985). His works have achieved significant critical acclaim and widespread commercial success, popularizing magical realism.',
    notableWorks: [
      { title: 'One Hundred Years of Solitude (Cien años de soledad)', year: '1967', callNumber: 'DEWEY 863.64', medium: 'First Edition Sudamericana' },
      { title: 'Love in the Time of Cholera', year: '1985', callNumber: 'DEWEY 863.64', medium: 'Novel' },
      { title: 'Chronicle of a Death Foretold', year: '1981', callNumber: 'DEWEY 863.64', medium: 'Novella' }
    ],
    milestones: [
      { year: '1967', event: 'Published Cien años de soledad in Buenos Aires to instantaneous worldwide acclaim.' },
      { year: '1982', event: 'Awarded the Nobel Prize in Literature "for his novels and short stories".' },
      { year: '1995', event: 'Founded the Fundación Gabo for new Latin American investigative journalism.' }
    ],
    archivalHoldings: 15,
    rarities: ['1967 Editorial Sudamericana first printing with ship cover illustration', 'Signed 1982 Nobel address brochure'],
    accentColor: '#eab308'
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    honorific: 'Roman Emperor & Stoic Philosopher',
    lifespan: '121 – 180 CE',
    era: 'Classical Antiquity',
    movement: 'Classical Antiquity',
    nationality: 'Roman',
    genres: ['Stoic Philosophy', 'Personal Ethics', 'Meditations', 'Classical Epistles'],
    portrait: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    quote: 'The happiness of your life depends upon the quality of your thoughts.',
    bio: 'Marcus Aurelius Antoninus was Roman emperor from 161 to 180 CE and a Stoic philosopher. He was the last of the rulers known as the Five Good Emperors, and the last emperor of the Pax Romana, an age of relative peace and stability for the Roman Empire.',
    extendedBio: 'His personal philosophical writings, now known as Meditations (originally titled "To Himself"), were written in Greek as a source for his own guidance and self-improvement during military campaigns along the northern frontier. They remain one of the greatest enduring works of Stoic philosophy.',
    notableWorks: [
      { title: 'Meditations (Τὰ εἰς ἑαυτόν)', year: 'c. 175 CE', callNumber: 'VAULT-CLASSIC-01', medium: 'Greek Codex Edition' },
      { title: 'Epistles to Fronto', year: 'c. 140–165 CE', callNumber: 'DEWEY 188', medium: 'Palimpsest Transcription' },
      { title: 'Imperial Decrees on Justice', year: '177 CE', callNumber: 'DEWEY 340.54', medium: 'Legal Compendium' }
    ],
    milestones: [
      { year: '161 CE', event: 'Acceded to the Roman imperial throne alongside Lucius Verus.' },
      { year: '170–180 CE', event: 'Penned the 12 books of the Meditations while encamped at Carnuntum.' },
      { year: '1558', event: 'First printed Greek edition produced in Zurich by Wilhelm Xylander.' }
    ],
    archivalHoldings: 8,
    rarities: ['1558 Xylander editio princeps printed in Zurich', '1634 Meric Casaubon first English translation'],
    accentColor: '#ca8a04'
  },
  {
    id: 'ursula-k-le-guin',
    name: 'Ursula K. Le Guin',
    honorific: 'Grand Master of Speculative Thought',
    lifespan: '1929 – 2018',
    era: 'Late 20th Century & New Wave',
    movement: 'Contemporary',
    nationality: 'American',
    genres: ['Speculative Fiction', 'Taoist Philosophy', 'Anthropological Sci-Fi', 'Feminist Poetics'],
    portrait: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    quote: 'We read books to find out who we are. What other people, real or imaginary, do and think and feel is an essential guide to who we are ourselves.',
    bio: 'Ursula Kroeber Le Guin was an American author of speculative fiction, including works of science fiction, fantasy, and poetry. She was first published in 1959, and her literary career spanned nearly sixty years, producing more than twenty novels and over a hundred short stories.',
    extendedBio: 'Le Guin’s writing was influenced by cultural anthropology, Taoism, feminism, and anarchism. Her notable works include the Earthsea fantasy series and the Hainish Cycle science fiction universe, featuring the seminal novels A Wizard of Earthsea (1968), The Left Hand of Darkness (1969), and The Dispossessed (1974).',
    notableWorks: [
      { title: 'The Left Hand of Darkness', year: '1969', callNumber: 'DEWEY 813.54', medium: 'Ace Science Fiction First Printing' },
      { title: 'The Dispossessed: An Ambiguous Utopia', year: '1974', callNumber: 'DEWEY 813.54', medium: 'First Edition' },
      { title: 'A Wizard of Earthsea', year: '1968', callNumber: 'DEWEY 813.54', medium: 'Parnassus Press Illustrated' }
    ],
    milestones: [
      { year: '1969', event: 'Published The Left Hand of Darkness, winning both Hugo and Nebula awards.' },
      { year: '1974', event: 'Published The Dispossessed, exploring anarcho-syndicalist philosophy.' },
      { year: '2014', event: 'Awarded the National Book Foundation Medal for Distinguished Contribution to American Letters.' }
    ],
    archivalHoldings: 13,
    rarities: ['1969 First Edition paperback with Ruth Robbins map endpapers', 'Signed translation of the Tao Te Ching'],
    accentColor: '#14b8a6'
  },
  {
    id: 'galileo-galilei',
    name: 'Galileo Galilei',
    honorific: 'Father of Modern Observational Astronomy',
    lifespan: '1564 – 1642',
    era: 'The Renaissance & Scientific Revolution',
    movement: 'Renaissance',
    nationality: 'Italian',
    genres: ['Observational Astronomy', 'Kinematics', 'Scientific Methodology', 'Dialogues'],
    portrait: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    quote: 'Philosophy is written in this grand book — I mean the universe — which stands continually open to our gaze, but it cannot be understood unless one first learns to comprehend the language in which it is composed. It is written in the language of mathematics.',
    bio: 'Galileo di Vincenzo Bonaiuti de\' Galilei was an Italian astronomer, physicist and engineer, sometimes described as a polymath. His telescope observations confirmed the phases of Venus, discovered the four largest moons of Jupiter, and supported the Copernican heliocentric model.',
    extendedBio: 'Galileo has been called the "father of observational astronomy", modern physics, the scientific method, and modern science. His conflict with the Roman Catholic Inquisition in 1633 culminated in his trial and lifelong house arrest, during which he wrote Two New Sciences, summarizing his work on kinematics and material strength.',
    notableWorks: [
      { title: 'Sidereus Nuncius (Starry Messenger)', year: '1610', callNumber: 'VAULT-GAL-01', medium: 'Venetian Folio' },
      { title: 'Dialogo sopra i due massimi sistemi del mondo', year: '1632', callNumber: 'VAULT-GAL-02', medium: 'First Edition Florence' },
      { title: 'Discorsi e dimostrazioni matematiche intorno a due nuove scienze', year: '1638', callNumber: 'DEWEY 531', medium: 'Elzevir Press Leiden' }
    ],
    milestones: [
      { year: '1609', event: 'Constructed his improved 20x magnification refracting telescope in Venice.' },
      { year: '1610', event: 'Discovered the Galilean moons of Jupiter (Io, Europa, Ganymede, Callisto).' },
      { year: '1638', event: 'Smuggled Two New Sciences to the Netherlands for publication by the Elzevirs.' }
    ],
    archivalHoldings: 6,
    rarities: ['1610 Sidereus Nuncius with original copperplate lunar engraving prints', '1638 Elzevir Press Two New Sciences'],
    accentColor: '#6366f1'
  },
  {
    id: 'toni-morrison',
    name: 'Toni Morrison',
    honorific: 'Nobel Laureate & Presidential Medal of Freedom',
    lifespan: '1931 – 2019',
    era: 'Contemporary & 20th Century Master',
    movement: 'Contemporary',
    nationality: 'American',
    genres: ['Historical Fiction', 'Mythic Realism', 'Literary Criticism', 'Editorials'],
    portrait: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    quote: 'We die. That may be the meaning of life. But we do language. That may be the measure of our lives.',
    bio: 'Chloe Anthony Wofford Morrison was an American novelist. Her first novel, The Bluest Eye, was published in 1970. The critically acclaimed Song of Solomon (1977) brought her national attention and won the National Book Critics Circle Award. In 1988, Morrison won the Pulitzer Prize for Beloved.',
    extendedBio: 'In 1993 she was awarded the Nobel Prize in Literature, becoming the first African-American woman to win the prize. Morrison’s works are praised for addressing the harsh consequences of racism in the United States and the Black American experience through poetic language and lush, layered narrative structure.',
    notableWorks: [
      { title: 'Beloved', year: '1987', callNumber: 'DEWEY 813.54', medium: 'First Edition Knopf' },
      { title: 'Song of Solomon', year: '1977', callNumber: 'DEWEY 813.54', medium: 'National Book Award Edition' },
      { title: 'Playing in the Dark: Whiteness and the Literary Imagination', year: '1992', callNumber: 'DEWEY 810.9', medium: 'Critical Lectures' }
    ],
    milestones: [
      { year: '1977', event: 'Published Song of Solomon to immense national and international acclaim.' },
      { year: '1988', event: 'Awarded the Pulitzer Prize for Fiction for Beloved.' },
      { year: '1993', event: 'Awarded the Nobel Prize in Literature.' }
    ],
    archivalHoldings: 17,
    rarities: ['1987 First printing Knopf archival copy with author bookplate', 'Audio recordings of 1993 Nobel Banquet lecture'],
    accentColor: '#be185d'
  }
];

const literaryMovements = [
  'All Movements',
  'Classical Antiquity',
  'Renaissance',
  'Enlightenment',
  'Romanticism',
  'Modernism',
  'Computing Pioneers',
  'Postmodern & Metaphysical',
  'Contemporary'
];

export default function Authors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovement, setSelectedMovement] = useState('All Movements');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [activeAuthorModal, setActiveAuthorModal] = useState(null);

  // Extract unique genres across authors
  const allGenres = useMemo(() => {
    const set = new Set(['All']);
    authorsData.forEach(a => a.genres.forEach(g => set.add(g)));
    return Array.from(set);
  }, []);

  // Filtered and sorted authors
  const filteredAuthors = useMemo(() => {
    return authorsData
      .filter((author) => {
        const matchesSearch =
          author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          author.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          author.notableWorks.some(w => w.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          author.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesMovement =
          selectedMovement === 'All Movements' || author.movement === selectedMovement;

        const matchesGenre =
          selectedGenre === 'All' || author.genres.includes(selectedGenre);

        return matchesSearch && matchesMovement && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'holdings') return b.archivalHoldings - a.archivalHoldings;
        if (sortBy === 'lifespan') {
          const aYear = parseInt(a.lifespan.match(/-?\d+/)?.[0] || '0', 10);
          const bYear = parseInt(b.lifespan.match(/-?\d+/)?.[0] || '0', 10);
          return aYear - bYear;
        }
        return 0;
      });
  }, [searchTerm, selectedMovement, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#090b11] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 border-b border-slate-200/80 dark:border-white/[0.08] archival-grid overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase tracking-widest border border-amber-500/20 font-bold">
              <Feather className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>THE SCHOLARLY PANTHEON &bull; BIOGRAPHICAL ARCHIVES</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              Curated Authors &amp; Seminal Thinkers
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              Explore the masterminds whose foundational proofs, literature, and philosophical inquiries define
              our repository stacks. Trace each creator’s archival folios, manuscripts, and notable works.
            </p>

            {/* Quick Metrics Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto">
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">12</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Featured Thinkers</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-amber-600 dark:text-amber-400 block">147+</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Archival Folios</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">8</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Literary Eras</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">100%</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Preserved in Vault</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────── */}
      <section className="sticky top-20 z-40 bg-[#fbf9f5]/95 dark:bg-[#090b11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search authors by name, notable work, genre, or biography..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Quick Select */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hidden sm:inline">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort authors"
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="name" className="dark:bg-slate-900">Name (A–Z)</option>
                  <option value="holdings" className="dark:bg-slate-900">Most Archival Folios</option>
                  <option value="lifespan" className="dark:bg-slate-900">Chronological Era</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 rounded-xl text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hidden sm:inline">GENRE:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  aria-label="Filter by genre"
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[140px] truncate"
                >
                  {allGenres.map((g) => (
                    <option key={g} value={g} className="dark:bg-slate-900">{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Literary Movement Pill Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0 mr-1">
              MOVEMENT:
            </span>
            {literaryMovements.map((movement) => {
              const active = selectedMovement === movement;
              return (
                <button
                  key={movement}
                  onClick={() => setSelectedMovement(movement)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                    active
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                      : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/[0.06]'
                  }`}
                >
                  {movement}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── ROTATING SPOTLIGHT QUOTE ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="hairline-card rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Quote className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1 text-center md:text-left">
            <p className="font-serif-editorial text-lg sm:text-2xl italic font-semibold text-slate-900 dark:text-white leading-snug">
              &ldquo;I have always imagined that Paradise will be a kind of library.&rdquo;
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-400">
              — Jorge Luis Borges &bull; Director of the National Library of Argentina (1955–1973)
            </p>
          </div>
          <Link
            to="/books?search=Borges"
            className="shrink-0 px-4 py-2 bg-white dark:bg-[#111523] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Inspect Borges Folios</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── MAIN AUTHORS GRID ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
            SHOWING {filteredAuthors.length} OF {authorsData.length} SCHOLARLY FIGURES
          </span>
          {(searchTerm || selectedMovement !== 'All Movements' || selectedGenre !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedMovement('All Movements');
                setSelectedGenre('All');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredAuthors.length === 0 ? (
          <div className="hairline-card rounded-2xl p-12 text-center bg-white dark:bg-[#111523] space-y-3">
            <Feather className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-serif-editorial text-xl font-bold text-slate-800 dark:text-slate-200">
              No Authors Matching Your Query
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
              Adjust your search keywords, literary era, or genre filters to uncover matching thinkers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author, index) => (
              <motion.article
                key={author.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="hairline-card rounded-2xl bg-white dark:bg-[#111523] p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                {/* Top Accent Stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all"
                  style={{ backgroundColor: author.accentColor }}
                />

                <div className="space-y-4">
                  
                  {/* Header & Avatar */}
                  <div className="flex items-start gap-4">
                    <img
                      src={author.portrait}
                      alt={author.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold">
                          {author.movement}
                        </span>
                        <span className="font-mono text-[9px] text-amber-700 dark:text-amber-400">
                          {author.nationality}
                        </span>
                      </div>
                      
                      <h2 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {author.name}
                      </h2>
                      
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {author.lifespan}
                      </p>
                    </div>
                  </div>

                  {/* Quote Callout */}
                  <div className="p-3.5 rounded-xl bg-[#fbf9f5] dark:bg-white/5 border border-slate-200/60 dark:border-white/[0.06] relative">
                    <Quote className="w-3.5 h-3.5 text-amber-500 absolute top-2.5 left-2.5 opacity-60" />
                    <p className="font-serif-editorial text-xs italic text-slate-700 dark:text-slate-300 pl-4 leading-relaxed line-clamp-2">
                      &ldquo;{author.quote}&rdquo;
                    </p>
                  </div>

                  {/* Bio Excerpt */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">
                    {author.bio}
                  </p>

                  {/* Notable Works Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block font-bold">
                      KEY ARCHIVAL EDITIONS:
                    </span>
                    <div className="space-y-1">
                      {author.notableWorks.slice(0, 2).map((work) => (
                        <div
                          key={work.title}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={work.title}>
                            {work.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                            {work.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Genres Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {author.genres.map((genre) => (
                      <span
                        key={genre}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <Bookmark className="w-3 h-3 text-amber-500" />
                    <span>{author.archivalHoldings} Folios in Stacks</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveAuthorModal(author)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                    >
                      Dossier
                    </button>
                    
                    <Link
                      to={`/books?search=${encodeURIComponent(author.name)}`}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xs"
                      title={`Search repository for all works by ${author.name}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </motion.article>
            ))}
          </div>
        )}

      </main>

      {/* ── AUTHOR BIOGRAPHICAL DOSSIER MODAL ──────────────────────── */}
      <AnimatePresence>
        {activeAuthorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveAuthorModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-5 mb-6 pr-8">
                <img
                  src={activeAuthorModal.portrait}
                  alt={activeAuthorModal.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-md shrink-0"
                />
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold mb-1">
                    {activeAuthorModal.movement} &bull; {activeAuthorModal.nationality}
                  </div>
                  <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {activeAuthorModal.name}
                  </h2>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeAuthorModal.lifespan} &bull; {activeAuthorModal.honorific}
                  </p>
                </div>
              </div>

              {/* Quote Banner */}
              <div className="p-4 rounded-2xl bg-[#fbf9f5] dark:bg-white/5 border border-slate-200/80 dark:border-white/10 mb-6">
                <Quote className="w-4 h-4 text-amber-500 mb-1" />
                <p className="font-serif-editorial text-sm italic text-slate-800 dark:text-slate-200 leading-relaxed">
                  &ldquo;{activeAuthorModal.quote}&rdquo;
                </p>
              </div>

              {/* Extended Biography */}
              <div className="space-y-3 mb-6">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  BIOGRAPHICAL RECORD &amp; LEGACY
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {activeAuthorModal.extendedBio}
                </p>
              </div>

              {/* Historical Milestones */}
              <div className="space-y-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>HISTORICAL TIMELINE &amp; MILESTONES</span>
                </h3>
                <div className="space-y-2 pt-1">
                  {activeAuthorModal.milestones.map((milestone) => (
                    <div key={milestone.year} className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0 w-12">
                        {milestone.year}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-normal">
                        {milestone.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preserved Notable Works in Catalog */}
              <div className="space-y-3 mb-6">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>CATALOGED VOLUMES IN OUR STACKS</span>
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                  {activeAuthorModal.notableWorks.map((work) => (
                    <div
                      key={work.title}
                      className="p-3 bg-white dark:bg-[#111523] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{work.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {work.medium} &bull; Published {work.year}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                        {work.callNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Vault Rarities */}
              <div className="space-y-2 mb-8">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  SPECIAL COLLECTIONS &amp; VAULT RARITIES:
                </h3>
                <ul className="space-y-1">
                  {activeAuthorModal.rarities.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <Link
                  to={`/books?search=${encodeURIComponent(activeAuthorModal.name)}`}
                  onClick={() => setActiveAuthorModal(null)}
                  className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore All {activeAuthorModal.name} Holdings in Catalog</span>
                </Link>
                <button
                  onClick={() => setActiveAuthorModal(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Close Dossier
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
