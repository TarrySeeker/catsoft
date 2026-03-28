# Инструкция по интеграции лендинга CatSoft в Laravel

Этот документ предназначен для backend-разработчика, который будет интегрировать новую верстку (Apple-style Dark Tech + GSAP) в существующий проект на Laravel.

## 1. Структура Blade-шаблонов

Для удобной поддержки огромного лендинга настоятельно рекомендуется использовать компонентный подход Blade.
Новая верстка `index.html` имеет четкую и последовательную семантическую структуру, которую легко разбить на части.

**Рекомендуемая структура директорий в `resources/views/`:**
```
resources/views/
├── layouts/
│   └── app.blade.php        # Главный каркас (head, подключение css/js, modals overlay)
├── partials/
│   ├── header.blade.php     # <header class="cs-header">
│   ├── footer.blade.php     # <footer class="cs-footer">
│   └── modals.blade.php     # Блок <div class="cs-modal-overlay"> со всеми окнами
├── sections/
│   ├── hero.blade.php
│   ├── stats.blade.php
│   ├── online-eval.blade.php
│   ├── audience.blade.php
│   ├── problems.blade.php
│   ├── choices.blade.php
│   ├── how-it-works.blade.php
│   ├── advantages.blade.php
│   ├── tariffs.blade.php
│   ├── marquee.blade.php
│   ├── faq.blade.php
│   └── contact.blade.php
└── pages/
    └── home.blade.php       # Сборка всех секций через @include()
```

В файле `home.blade.php` сборка будет выглядеть очень чисто:
```blade
@extends('layouts.app')

@section('content')
    @include('partials.header')
    
    <main class="cs-main">
        @include('sections.hero')
        @include('sections.stats')
        @include('sections.online-eval')
        @include('sections.audience')
        @include('sections.problems')
        @include('sections.choices')
        @include('sections.how-it-works')
        @include('sections.advantages')
        @include('sections.tariffs')
        @include('sections.marquee')
        @include('sections.faq')
        @include('sections.contact')
    </main>

    @include('partials.footer')
    @include('partials.modals')
@endsection
```

## 2. Ассеты (CSS, JS, Изображения и Видео)

Новая верстка избавлена от Bootstrap и JQuery.

1.  **CSS/JS:**
    *   Поместите файл `style.css` в `public/css/style.css`.
    *   Поместите файл `main.js` в `public/js/main.js`.
    *   В `layouts/app.blade.php` подключите их с помощью хелпера `asset()`:
        ```html
        <link rel="stylesheet" href="{{ asset('css/style.css') }}">
        ...
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
        <script src="{{ asset('js/main.js') }}"></script>
        ```

2.  **Изображения:**
    *   Сейчас в `index.html` картинки подключены по пути оригинального дампа (`./Единое решение..._files/название.webp`).
    *   Создайте папку `public/images/landing/` и скопируйте туда все картинки из папки старого сайта.
    *   Внутри Blade-шаблонов сделайте массовую автозамену путей в редакторе кода:
        *   **Найти:** `src="./Единое решение подбора и проценки Б_У запчастей со скидкой - Catsoft_files/`
        *   **Заменить на:** `src="{{ asset('images/landing/`
        *   Не забудьте закрыть скобки `') }}"` в конце каждого атрибута `src`.

3.  **Видео:**
    *   Оригинальные видео лежат по путям `/assets/tpl/cs/media/video-cut-ip.mp4` и `sto3.mp4`.
    *   Добавьте хелпер `asset()` в теги `<source src="{{ asset('assets/tpl/cs/media/video-cut-ip.mp4') }}" ...>` (в секции Hero и в Модальных окнах).

## 3. Форма обратной связи (/sendFeedBack)

В верстке присутствует форма обратной связи (как в самом блоке Контакты, так и в Модальном окне).

*   **URL отправки:** Форма имеет атрибут `action="/sendFeedBack"` и работает через метод `POST`.
*   **CSRF Токен:** Поскольку это Laravel, **ОБЯЗАТЕЛЬНО** добавьте `@csrf` внутрь каждого тега `<form class="cs-form-feedback">`, иначе Laravel отклонит запрос с ошибкой 419 (Page Expired).
*   **Поля формы:**
    *   `name="name"` (Имя)
    *   `name="phone"` (Телефон, required)
    *   `name="apply"` (Чекбокс согласия, checked, value="1", required)
*   **Логика JS:** В файле `main.js` (пункт 8) заложена базовая блокировка кнопки Submit (предотвращение двойного клика) до момента перезагрузки страницы или получения AJAX ответа. Если в проекте используется собственная AJAX-обработка (как на старом сайте через JQuery), вам нужно будет слегка адаптировать этот участок в `main.js` под ваш Fetch API или Axios.

## 4. Специфика CSS (Адаптив на 320px)

Верстка полностью подготовлена к любым мобильным устройствам (начиная от супер-мелких экранов iPhone SE - 320px). Для этого используется `clamp()` и относительные величины `rem/vw`. Не вносите жесткие фиксированные значения `width: 350px`, так как это сломает стекловидный дизайн (glassmorphism) на телефонах. Используйте `max-width` и %-значения.
