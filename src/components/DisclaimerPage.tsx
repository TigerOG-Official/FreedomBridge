import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

interface DisclaimerSection {
  title: string;
  content: string;
}

export default function DisclaimerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections: DisclaimerSection[] = [
    {
      title: t('disclaimer.sections.noInvestmentAdvice.title'),
      content: t('disclaimer.sections.noInvestmentAdvice.content')
    },
    {
      title: t('disclaimer.sections.risksOfUse.title'),
      content: t('disclaimer.sections.risksOfUse.content')
    },
    {
      title: t('disclaimer.sections.noWarranties.title'),
      content: t('disclaimer.sections.noWarranties.content')
    },
    {
      title: t('disclaimer.sections.limitationOfLiability.title'),
      content: t('disclaimer.sections.limitationOfLiability.content')
    },
    {
      title: t('disclaimer.sections.thirdPartyServices.title'),
      content: t('disclaimer.sections.thirdPartyServices.content')
    },
    {
      title: t('disclaimer.sections.regulatoryCompliance.title'),
      content: t('disclaimer.sections.regulatoryCompliance.content')
    },
    {
      title: t('disclaimer.sections.dyor.title'),
      content: t('disclaimer.sections.dyor.content')
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
              {t('disclaimer.title')}
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
            <AlertTriangle className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('disclaimer.header')}
          </h1>
          <p className="text-xl" style={{ color: 'var(--theme-text-secondary)' }}>
            {t('disclaimer.subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="border rounded-lg p-6"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-card-border)'
              }}
            >
              <h2
                className="text-xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
              >
                {section.title}
              </h2>
              <p
                className="leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-6 border rounded-lg text-center"
          style={{
            backgroundColor: 'var(--theme-section-bg)',
            borderColor: 'var(--theme-section-border)'
          }}
        >
          <p className="font-medium mb-4" style={{ color: 'var(--theme-text-primary)' }}>
            {t('disclaimer.acknowledgment')}
          </p>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            {t('disclaimer.lastUpdated')}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/")}
            className="btn-primary"
          >
            {t('common.backToApp')}
          </Button>
        </div>
      </main>
    </div>
  );
}
