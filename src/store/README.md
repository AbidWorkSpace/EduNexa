# Redux Store (RTK Query)

## Quick Start

### What's already done

1. **Redux Toolkit & RTK Query installed**
2. **Store configured** (`src/store/index.js`)
3. **Base API setup** (`src/store/api/base-api.js`)
4. **Redux Provider** in `app/layout.jsx`

### Current status

- Existing SWR hooks and Context API continue to work
- RTK Query is ready for new features (add slices under `src/store/api/`)

---

## Usage

### For new features

```javascript
// 1. Create API slice
// src/store/api/your-feature-api.js
import { baseApi } from './base-api';

export const yourFeatureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getData: builder.query({
      query: () => '/api/your-endpoint',
      providesTags: ['YourTag'],
    }),
  }),
});

export const { useGetDataQuery } = yourFeatureApi;

// 2. Use in component
import { useGetDataQuery } from 'src/store/api/your-feature-api';

function YourComponent() {
  const { data, isLoading } = useGetDataQuery();
  // ...
}
```

When adding `providesTags`, register matching entries in `base-api.js` `tagTypes`.

---

## File structure

```
src/store/
├── index.js
├── provider.jsx
├── hooks.js
├── README.md
├── RTK_QUERY_GUIDE.md
└── api/
    ├── base-api.js
    └── build-query-params.js
```

---

## Theme sync with upstream

Compare shared infrastructure against `PROJECT_NAME`:

```bash
npm run audit:theme-sync
```

See `scripts/diff-theme-clone.mjs` for watched paths.

---

## See also

- `RTK_QUERY_GUIDE.md` — detailed RTK + SWR hybrid notes
