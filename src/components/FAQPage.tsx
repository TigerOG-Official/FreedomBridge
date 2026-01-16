import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function FAQPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const faqs: FAQItem[] = [
    {
      question: t('faq.questions.q1'),
      answer: t('faq.questions.a1')
    },
    {
      question: t('faq.questions.q2'),
      answer: t('faq.questions.a2')
    },
    {
      question: t('faq.questions.q3'),
      answer: t('faq.questions.a3')
    },
    {
      question: t('faq.questions.q4'),
      answer: t('faq.questions.a4')
    },
    {
      question: t('faq.questions.q5'),
      answer: t('faq.questions.a5')
    },
    {
      question: t('faq.questions.q6'),
      answer: t('faq.questions.a6')
    },
    {
      question: t('faq.questions.q7'),
      answer: t('faq.questions.a7')
    },
    {
      question: t('faq.questions.q8'),
      answer: t('faq.questions.a8')
    }
  ];

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        background: 'var(--theme-bg)', 
        color: 'var(--theme-text-primary)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--theme-navbar-bg)', 
          borderColor: 'var(--theme-navbar-border)' 
        }}
      >
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 hover:bg-transparent hover:text-[var(--primary)]"
            onClick={() => navigate("/")}
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backToApp')}
          </Button>
          <div className="mr-4 hidden md:flex">
            <span 
              className="font-bold sm:inline-block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('faq.title')}
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <div 
            className="p-3 rounded-full w-fit mx-auto mb-4"
            style={{ backgroundColor: 'var(--theme-percent-25-bg)' }}
          >
            <HelpCircle className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 
            className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('faq.header')}
          </h1>
          <p className="text-xl" style={{ color: 'var(--theme-text-secondary)' }}>
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div 
          className="mt-16 text-center p-8 border rounded-2xl shadow-sm"
          style={{ 
            backgroundColor: 'var(--theme-section-bg)', 
            borderColor: 'var(--theme-section-border)' 
          }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t('faq.cta.title')}</h3>
          <p className="mb-6" style={{ color: 'var(--theme-text-muted)' }}>
            {t('faq.cta.description')}
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/wiki")}
              className="btn-primary"
            >
              {t('faq.cta.wiki')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open("https://t.me/OfficialTigerOG", "_blank")}
              style={{ 
                borderColor: 'var(--primary)', 
                color: 'var(--theme-text-primary)' 
              }}
            >
              {t('faq.cta.telegram')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="border rounded-lg overflow-hidden transition-all duration-200"
      style={{ 
        backgroundColor: 'var(--theme-card-bg)', 
        borderColor: 'var(--theme-card-border)' 
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-[var(--theme-section-hover-bg)] transition-colors focus:outline-none"
        style={{ color: 'var(--theme-text-primary)' }}
      >
        <span className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="p-4 pt-0 leading-relaxed border-t"
              style={{ 
                color: 'var(--theme-text-secondary)',
                borderColor: 'var(--theme-section-border)',
                backgroundColor: 'var(--theme-section-bg)'
              }}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
