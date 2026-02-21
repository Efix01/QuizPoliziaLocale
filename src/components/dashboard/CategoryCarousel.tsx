import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Target,
    TreePine,
    Leaf,
    Bug,
    Scale,
    Flame,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useAnimations';

import { useQuiz } from '../../context/QuizContext';

interface CategoryCarouselProps {
    isAuthenticated: boolean;
    loading?: boolean;
}

const FREE_CATEGORY_IDS = ['botanica', 'fauna', 'ecologia'];

const CATEGORIES = [
    { id: 'istituzionale', name: 'Istituzionale (L.R. 26/1985)', icon: Scale, gradient: 'diritto' },
    { id: 'ecologia', name: 'Ecologia e Selvicoltura', icon: TreePine, gradient: 'ecologia' },
    { id: 'botanica', name: 'Botanica', icon: Leaf, gradient: 'botanica' },
    { id: 'zoologia', name: 'Zoologia', icon: Bug, gradient: 'fauna' },
    { id: 'geografia', name: 'Geografia della Sardegna', icon: MapPin, gradient: 'geografia' },
    { id: 'legislazione', name: 'Legislazione Forestale', icon: BookOpen, gradient: 'inglese' },
    { id: 'aree', name: 'Aree Protette (L. 394/1991)', icon: TreePine, gradient: 'ecologia' },
    { id: 'incendi', name: 'Incendi Boschivi (L. 353/2000)', icon: Flame, gradient: 'incendi' },
    { id: 'penale', name: 'Diritto Penale e Procedura Penale', icon: Scale, gradient: 'diritto' },
    { id: 'reati', name: 'Reati Ambientali', icon: Flame, gradient: 'incendi' },
    { id: 'fauna', name: 'Fauna (L. 157/1992)', icon: Bug, gradient: 'fauna' },
    { id: 'informatica', name: 'Informatica', icon: Target, gradient: 'informatica' },
];

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ isAuthenticated, loading = false }) => {
    const navigate = useNavigate();
    const { questions } = useQuiz();
    const [categoriesRef, categoriesVisible] = useScrollAnimation<HTMLElement>();
    const categoriesScrollRef = useRef<HTMLDivElement>(null);

    // Generate stable random widths for progress bars
    const progressWidths = React.useMemo(() => {
        return CATEGORIES.map((_, index) => ((index * 37) % 60) + 20); // Deterministic "random" 20-80%
    }, []);

    const getCategoryCount = (categoryId: string) => {
        return questions.filter(q =>
            q.category.toLowerCase().includes(categoryId.toLowerCase())
        ).length;
    };

    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoriesScrollRef.current) {
            const scrollAmount = 320; // ~2 cards
            categoriesScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            ref={categoriesRef}
            className={`section animate-on-scroll ${categoriesVisible ? 'is-visible' : ''}`}
        >
            <div className="section-header">
                <h2 className="section-title">Esplora per argomento</h2>
            </div>

            <div className="categories-wrapper">
                <button
                    className="categories-arrow categories-arrow--left"
                    onClick={() => scrollCategories('left')}
                    aria-label="Scorri a sinistra"
                >
                    <ChevronLeft />
                </button>

                <div className="categories-scroll" ref={categoriesScrollRef}>
                    {CATEGORIES.map((cat, index) => {
                        const count = getCategoryCount(cat.id);
                        const Icon = cat.icon;
                        const isFreeCategory = FREE_CATEGORY_IDS.includes(cat.id);
                        const isLocked = !isAuthenticated && !isFreeCategory;

                        return (
                            <div
                                key={cat.id}
                                className={`category-card category-card--${cat.gradient} hover-scale`}
                                onClick={() => {
                                    if (isLocked) {
                                        navigate('/login');
                                    } else {
                                        navigate('/study', { state: { category: cat.name } });
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                style={{
                                    transitionDelay: categoriesVisible ? `${index * 0.05}s` : '0s',
                                    position: 'relative'
                                }}
                            >
                                {isLocked && (
                                    <div className="category-locked">
                                        <span className="category-lock-icon">🔒</span>
                                    </div>
                                )}

                                <div className="category-icon">
                                    <Icon />
                                </div>
                                <span className="category-title">{cat.name}</span>
                                <span className="category-count">{loading ? '—' : `${count} domande`}</span>
                                <div className="category-progress">
                                    <div
                                        className="category-progress-fill"
                                        style={{ width: `${progressWidths[index]}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className="categories-arrow categories-arrow--right"
                    onClick={() => scrollCategories('right')}
                    aria-label="Scorri a destra"
                >
                    <ChevronRight />
                </button>
            </div>
        </section>
    );
};

export default CategoryCarousel;
