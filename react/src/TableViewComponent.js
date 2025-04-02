import React, { useState, useEffect } from 'react';
import translate from './libs/translations';

const TableViewComponent = ({ results }) => {
  const [noResultsText, setNoResultsText] = useState('Loading...');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [translatedLabels, setTranslatedLabels] = useState({});
  const [structuredSearchProps, setStructuredSearchProps] = useState(window.mw?.config.get('structuredSearchProps') || {});
  const DEFAULT_IMAGE = "/default-image.jpg";

  const dynamicFields = (structuredSearchProps.table || "")
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);

  const allFields = ['title', ...dynamicFields];

  // Fetch translations and structuredSearchProps
  useEffect(() => {
    translate('structuredsearch-no-results').then(setNoResultsText);

    const fetchAllLabels = async () => {
      const entries = await Promise.all(
        allFields.map(async (field) => {
          const key = `structuredsearch-table-${field}`;

          const translated = await translate(key);
          return [field, translated];
        })
      );
      setTranslatedLabels(Object.fromEntries(entries));
    };

    fetchAllLabels();

    const checkStructuredSearchProps = () => {
      const updatedProps = window.mw?.config.get("structuredSearchProps") || {};
      if (Object.keys(updatedProps).length > 0) {
        setStructuredSearchProps(updatedProps);
        clearInterval(interval);
      }
    };

    // Periodically check for props, then clean up
    const interval = setInterval(checkStructuredSearchProps, 500);
    const timeout = setTimeout(() => clearInterval(interval), 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const getLabel = (field) => {
    return translatedLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aVal = a[sortConfig.key] ?? '';
    let bVal = b[sortConfig.key] ?? '';

    if (sortConfig.key === 'date' && a.timestamp && b.timestamp) {
      aVal = new Date(a.timestamp);
      bVal = new Date(b.timestamp);
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (!results || !results.length) {
    return <div>{noResultsText}</div>;
  }
  return (
    <table style={{ backgroundColor: 'white' }} className="results-table table-auto w-full border-collapse border border-gray-300 dark:border-gray-700">
    <thead className="bg-gray-100 dark:bg-gray-800">
  <tr>
    <th className="border p-2"></th> {/* Image */}
    <th
  onClick={() => handleSort('title')}
  className="border p-2 capitalize cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
>
  {getLabel('title')}
  <i className={`fal ml-1 ${sortConfig.key === 'title'
    ? sortConfig.direction === 'asc'
      ? 'fa-caret-up'
      : 'fa-caret-down'
    : 'fa-sort'}`} />
</th>

    {dynamicFields.map((field, i) => (
      <th
        key={i}
        onClick={() => handleSort(field)}
        className={`border p-2 capitalize cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 dynamicfields sm:table-cell`}
      >
        {getLabel(field)}
        <i className={`fal ml-1 ${sortConfig.key === field
          ? sortConfig.direction === 'asc'
            ? 'fa-caret-up'
            : 'fa-caret-down'
          : 'fa-sort'}`} />
      </th>
    ))}
  </tr>
</thead>

<tbody>
  {sortedResults.map((result, index) => (
    <tr key={index} className="border-t hover:bg-gray-50 dark:hover:bg-gray-900">
      {/* Image */}
      <td className="border p-2 text-center">
      <div
  style={result.page_image_ext ? {  backgroundImage: `url(${result.page_image_ext})` } : {}}

    className={`result-img w-20 h-20 bg-center bg-cover rounded border dark:border-gray-600 ${!result.page_image_ext ? 'result-img-default' : ''}`}
    role="img"
    aria-label={result.short_title}
  ></div>
      </td>

      {/* Title */}
      <td className="border p-2 align-top text-sm text-blue-600 dark:text-blue-300">
        <a href={result.full_title} className="hover:underline font-semibold">
          {result.short_title}
        </a>
      </td>

      {/* Dynamic Fields (hidden on mobile) */}
      {dynamicFields.map((field, i) => {
        let value = result[field];

        if (field === 'date' && typeof result.timestamp === 'string') {
          const [year, month, day] = result.timestamp.slice(0, 10).split("-");
          value = `${day}/${month}/${year}`;
        }

        if (field === 'category' && Array.isArray(value)) {
          return (
            <td key={i} className="border p-2 align-top text-sm dynamicfields sm:table-cell">
              <div className="flex flex-wrap gap-2">
                {value.map((cat, j) => (
                  <a
                    key={j}
                    href={`/${cat.link}`}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:underline dark:bg-blue-800 dark:text-blue-200"
                    title={`Category: ${cat.name}`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </td>
          );
        }

        return (
          <td key={i} className="border p-2 align-top text-sm text-gray-700 dark:text-gray-300 dynamicfields sm:table-cell">
            {value || <span className="text-gray-400 italic"></span>}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

    </table>
  );
};

export default TableViewComponent;
