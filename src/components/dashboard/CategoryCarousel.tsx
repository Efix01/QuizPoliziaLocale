import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scale, Map, FileText, BookOpen, Gavel, ShieldAlert,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useAnimations';
import { usePL } from '../../context/PLContext';

interface CategoryCarouselProps {
    isAuthenticated: boolean;
    loading?: boolean;
}

const CATEGORIES = [
    { id: 'cds', name: 'Codice della Strada', icon: Map, gradient: 'cds' },
    { id: 'tuel', name: 'Ordinamento Enti Locali', icon: Scale, gradient: 'tuel' },
    { id: 'san_amm', name: 'Sanzioni Amministrative', icon: FileText, gradient: 'san_amm' },
    { id: 'dir_amm', name: 'Diritto Amministrativo', icon: BookOpen, gradient: 'dir_amm' },
    { id: 'dir_pen', name: 'Diritto Penale', icon: Gavel, gradient: 'dir_pen' },
    { id: 'proc_pen', name: 'Procedura Penale', icon: ShieldAlert, gradient: 'proc_pen' },
];

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ loading = false }) => {
    const navigate = useNavigate();
    const { domandeCore } = usePL();
    const [categoriesRef, categoriesVisible] = useScrollAnimation<HTMLElement>();
    const categoriesScrollRef = React.useRef<HTMLDivElement>(null);

    const getCategoryCount = (categoryId: string) => {
        return domandeCore.filter(d => d.categoriaId === categoryId).length;
    };

    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoriesScrollRef.current) {
            const scrollAmount = 320;
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

                        return (
                            <div
                                key={cat.id}
                                className={`category-card category-card--${cat.gradient} hover-scale`}
                                onClick={() => navigate('/quiz-veloce')}
                                role="button"
                                tabIndex={0}
                                style={{
                                    transitionDelay: categoriesVisible ? `${index * 0.05}s` : '0s',
                                }}
                            >
                                <div className="category-icon">
                                    <Icon />
                                </div>
                                <span className="category-title">{cat.name}</span>
                                <span className="category-count">{loading ? '—' : `${count} domande`}</span>
                                <div className="category-progress">
                                    <div
                                        className="category-progress-fill"
                                        style={{ width: '0%' }}
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
