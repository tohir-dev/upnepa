// File: lib/aacilnsty.js;
// Functions for analyzing power grid data

export function calculateSystemHealth(powerStatus) {
  // Calculate overall system health based on active components
  let totalComponents = 0;
  let activeComponents = 0;

  Object.keys(powerStatus).forEach((id) => {
    totalComponents++;
    if (powerStatus[id].active) {
      activeComponents++;
    }
  });

  return {
    percentageActive: Math.round((activeComponents / totalComponents) * 100),
    activeCount: activeComponents,
    totalCount: totalComponents,
  };
}

export function calculateAreaStatistics(powerLines, transformers, powerStatus) {
  // Group statistics by area
  const areaStats = {};

  // Process power lines
  powerLines.forEach((line) => {
    if (!areaStats[line.area]) {
      areaStats[line.area] = {
        totalLines: 0,
        activeLines: 0,
        totalTransformers: 0,
        activeTransformers: 0,
        totalLoad: 0,
      };
    }

    areaStats[line.area].totalLines++;
    if (powerStatus[line.id]?.active) {
      areaStats[line.area].activeLines++;
      areaStats[line.area].totalLoad += powerStatus[line.id]?.load || 0;
    }
  });

  // Process transformers
  transformers.forEach((transformer) => {
    // Extract area from address (simplified approach)
    const transformerArea = transformer.address.split(",").pop().trim();

    if (!areaStats[transformerArea]) {
      areaStats[transformerArea] = {
        totalLines: 0,
        activeLines: 0,
        totalTransformers: 0,
        activeTransformers: 0,
        totalLoad: 0,
      };
    }

    areaStats[transformerArea].totalTransformers++;
    if (powerStatus[transformer.id]?.active) {
      areaStats[transformerArea].activeTransformers++;
    }
  });

  // Calculate percentages and other derived metrics
  Object.keys(areaStats).forEach((area) => {
    const stats = areaStats[area];
    stats.percentLineActive =
      stats.totalLines > 0
        ? Math.round((stats.activeLines / stats.totalLines) * 100)
        : 0;
    stats.percentTransformerActive =
      stats.totalTransformers > 0
        ? Math.round((stats.activeTransformers / stats.totalTransformers) * 100)
        : 0;
  });

  return areaStats;
}
