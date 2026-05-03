import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageService } from '../language.service';

interface DocumentationLink {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  href: string;
}

interface DocumentationGroup {
  titleAr: string;
  titleEn: string;
  noteAr: string;
  noteEn: string;
  links: DocumentationLink[];
}

@Component({
  selector: 'app-documentation-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './documentation-page.component.html',
  styleUrl: './documentation-page.component.scss'
})
export class DocumentationPageComponent {
  readonly language = inject(LanguageService);

  readonly groups: DocumentationGroup[] = [
    {
      titleAr: 'الوثائق الأساسية',
      titleEn: 'Core Documents',
      noteAr: 'الملفات التي تلخص المشروع وتعرضه بشكل رسمي.',
      noteEn: 'The primary files that summarize and present the project.',
      links: [
        {
          titleAr: 'فهرس الوثائق',
          titleEn: 'Documentation Index',
          descriptionAr: 'بوابة منظمة تحتوي على بقية الملفات.',
          descriptionEn: 'A structured hub that gathers the rest of the documents.',
          href: '/docs/index.html'
        },
        {
          titleAr: 'التقرير النهائي',
          titleEn: 'Final Report',
          descriptionAr: 'ملف التقرير الكامل للمشروع.',
          descriptionEn: 'The full project report file.',
          href: '/docs/report.html'
        },
        {
          titleAr: 'مخطط ERD',
          titleEn: 'ERD Diagram',
          descriptionAr: 'يوضح علاقة الجداول داخل قاعدة البيانات.',
          descriptionEn: 'Shows the relation between the database tables.',
          href: '/docs/database-erd.html'
        }
      ]
    },
    {
      titleAr: 'الملفات المساندة',
      titleEn: 'Supporting Files',
      noteAr: 'مواد إضافية تساعد في التسليم والعرض.',
      noteEn: 'Supplementary material for submission and presentation.',
      links: [
        {
          titleAr: 'قائمة المتطلبات',
          titleEn: 'Requirements Checklist',
          descriptionAr: 'قائمة التحقق العربية للمتطلبات.',
          descriptionEn: 'The Arabic requirements checklist.',
          href: '/docs/requirements-checklist-ar.html'
        },
        {
          titleAr: 'أدوار الفريق',
          titleEn: 'Team Roles',
          descriptionAr: 'توزيع الأدوار والمسؤوليات بين الفريق.',
          descriptionEn: 'How the team responsibilities are distributed.',
          href: '/docs/team-roles.html'
        },
        {
          titleAr: 'سكريبت الفيديو',
          titleEn: 'Video Script',
          descriptionAr: 'نص العرض التقديمي والفيديو.',
          descriptionEn: 'The presentation and demo video script.',
          href: '/docs/video-script.html'
        }
      ]
    }
  ];

  readonly totalFiles = this.groups.reduce((count, group) => count + group.links.length, 0);

  t(ar: string, en: string): string {
    return this.language.current() === 'ar' ? ar : en;
  }
}