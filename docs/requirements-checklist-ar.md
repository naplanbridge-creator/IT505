# قائمة تحقق متطلبات مشروع IT505

## ملخص سريع
هذا الملف يوضح المتطلبات المطلوبة في التكليف، هل تم تنفيذها أم لا، وأين مكانها داخل المشروع.

## المتطلبات المنفذة
- [x] **تطبيق بواجهة رسومية مناسبة لمبادئ HCI** مع ألوان واضحة وخطوط مريحة وسهلة القراءة.  
  **مكانه:** [frontend/src/app/app.html](../frontend/src/app/app.html)، [frontend/src/app/app.scss](../frontend/src/app/app.scss)

- [x] **استخدام قاعدة بيانات آمنة** مع Entity Framework Core بنمط code-first وSQLite، بدون SQL خام في المنطق الأساسي.  
  **مكانه:** [backend/Data/ApplicationDbContext.cs](../backend/Data/ApplicationDbContext.cs)، [backend/Program.cs](../backend/Program.cs)، [backend/appsettings.json](../backend/appsettings.json)

- [x] **استخدام .NET 10 وAngular وcode-first** كما هو مطلوب في المشروع.  
  **مكانه:** [backend/IT505.Api.csproj](../backend/IT505.Api.csproj)، [frontend/package.json](../frontend/package.json)، [frontend/angular.json](../frontend/angular.json)

- [x] **نموذج بحث عن الموظفين** يدعم البحث بالاسم والكود وتاريخ التعيين.  
  **مكانه:** [backend/Controllers/EmployeesController.cs](../backend/Controllers/EmployeesController.cs)، [frontend/src/app/app.ts](../frontend/src/app/app.ts)، [frontend/src/app/app.html](../frontend/src/app/app.html)

- [x] **عرض البيانات الناتجة في جدول/شبكة بيانات** بعد البحث.  
  **مكانه:** [frontend/src/app/app.html](../frontend/src/app/app.html)

- [x] **نموذج إدخال لكل جدول** في قاعدة البيانات، مع كل الحقول المطلوبة للإضافة.  
  **مكانه:** [frontend/src/app/app.html](../frontend/src/app/app.html)، [backend/Controllers/DepartmentsController.cs](../backend/Controllers/DepartmentsController.cs)، [backend/Controllers/EmployeesController.cs](../backend/Controllers/EmployeesController.cs)
  **ملاحظة:** تم اعتماد استجابة إنشاء صريحة من الخادم لحفظ السجلات الجديدة بدون مشاكل في توليد المسار.

- [x] **نافذة/حوار تأكيد قبل الحذف** حتى لا يتم حذف أي سجل بالخطأ.  
  **مكانه:** [frontend/src/app/app.html](../frontend/src/app/app.html)، [frontend/src/app/app.ts](../frontend/src/app/app.ts)

- [x] **تنبيهات ورسائل تنبيه للحالات المهمة** مثل النجاح والتحذير والخطأ والمعلومات.  
  **مكانه:** [frontend/src/app/app.html](../frontend/src/app/app.html)، [frontend/src/app/app.ts](../frontend/src/app/app.ts)، [frontend/src/app/app.scss](../frontend/src/app/app.scss)

- [x] **قاعدة بيانات تحتوي على جدول Department وجدول Employee** مع علاقة واحد إلى متعدد بينهما.  
  **مكانه:** [backend/Data/ApplicationDbContext.cs](../backend/Data/ApplicationDbContext.cs)، [docs/database-erd.md](database-erd.md)

- [x] **تقرير يوضح Problem Definition and Objectives**.  
  **مكانه:** [docs/report-outline.md](report-outline.md)

- [x] **تقرير يوضح لغات البرمجة وبيئة التطوير المستخدمة**.  
  **مكانه:** [docs/report-outline.md](report-outline.md)

- [x] **تقرير يضم ERD لقاعدة البيانات**.  
  **مكانه:** [docs/database-erd.md](database-erd.md)

- [x] **تقرير يضم أسماء الفريق كاملة**.  
  **مكانه:** [docs/report-outline.md](report-outline.md)، [docs/team-roles.md](team-roles.md)

- [x] **خطة توزيع الكلام في الفيديو على أعضاء الفريق الخمسة**.  
  **مكانه:** [docs/team-roles.md](team-roles.md)، [docs/video-script.md](video-script.md)

## المتطلبات التي ما زالت تحتاج استكمالًا قبل التسليم النهائي
- [ ] **لقطات الشاشة لجميع النماذج والشاشات** المطلوبة في التقرير.  
  **المطلوب إضافته:** خذ screenshots من الواجهة الحالية داخل المتصفح ثم أضفها إلى التقرير أو مجلد مخصص للتسليم.

- [ ] **صور أعضاء الفريق داخل الفيديو أو العرض النهائي**.  
  **المطلوب إضافته:** أضف صورة كل عضو أثناء التسجيل أو داخل العرض النهائي حسب المطلوب في التكليف.

## ملاحظة
إذا أردت، يمكن نقل هذا المحتوى أيضًا إلى ملف تسليم مختصر بالعربية داخل `README.md` أو دمجه مباشرة داخل التقرير النهائي.