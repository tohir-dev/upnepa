export async function fetchPowerLineData() {
  // In a real application, this would fetch from your backend API
  // For demo purposes, we're returning mock data with street-level detail
  
  // Main distribution and transmission lines
  const mainLines = [
    {
      id: 'line1',
      name: 'Ikeja Distribution Line',
      type: 'Distribution',
      area: 'Ikeja',
      path: [
        { lat: 6.6018, lng: 3.3515 },
        { lat: 6.6139, lng: 3.3421 },
        { lat: 6.6218, lng: 3.3359 },
        { lat: 6.6301, lng: 3.3198 },
      ],
    },
    {
      id: 'line2',
      name: 'Lagos Island Transmission',
      type: 'Transmission',
      area: 'Lagos Island',
      path: [
        { lat: 6.4550, lng: 3.3941 },
        { lat: 6.4498, lng: 3.4026 },
        { lat: 6.4425, lng: 3.4102 },
        { lat: 6.4361, lng: 3.4211 },
      ],
    },
    {
      id: 'line3',
      name: 'Ajah Power Line',
      type: 'Transmission',
      area: 'Ajah',
      path: [
        { lat: 6.4698, lng: 3.5652 },
        { lat: 6.4789, lng: 3.5598 },
        { lat: 6.4901, lng: 3.5523 },
        { lat: 6.5011, lng: 3.5412 },
      ],
    },
    {
      id: 'line4',
      name: 'Mainland Connection',
      type: 'Transmission',
      area: 'Mainland',
      path: [
        { lat: 6.5008, lng: 3.3792 },
        { lat: 6.5089, lng: 3.3698 },
        { lat: 6.5177, lng: 3.3612 },
        { lat: 6.5244, lng: 3.3502 },
      ],
    },
    {
      id: 'line5',
      name: 'Ikorodu Distribution',
      type: 'Distribution',
      area: 'Ikorodu',
      path: [
        { lat: 6.6018, lng: 3.5042 },
        { lat: 6.6105, lng: 3.4952 },
        { lat: 6.6198, lng: 3.4844 },
        { lat: 6.6287, lng: 3.4741 },
      ],
    },
  ];
  
  // Street-level distribution lines in Ikeja area
  const ikejaStreetLines = [
    {
      id: 'ikeja-street1',
      name: 'Allen Avenue Line',
      type: 'Street Distribution',
      area: 'Ikeja',
      path: [
        { lat: 6.6018, lng: 3.3515 }, // Connects to main line
        { lat: 6.6035, lng: 3.3510 },
        { lat: 6.6052, lng: 3.3505 },
        { lat: 6.6069, lng: 3.3500 },
      ],
    },
    {
      id: 'ikeja-street2',
      name: 'Awolowo Way Line',
      type: 'Street Distribution',
      area: 'Ikeja',
      path: [
        { lat: 6.6139, lng: 3.3421 }, // Connects to main line
        { lat: 6.6135, lng: 3.3405 },
        { lat: 6.6130, lng: 3.3390 },
        { lat: 6.6125, lng: 3.3375 },
      ],
    },
    {
      id: 'ikeja-street3',
      name: 'Toyin Street Line',
      type: 'Street Distribution',
      area: 'Ikeja',
      path: [
        { lat: 6.6035, lng: 3.3510 }, // Connects to Allen Avenue
        { lat: 6.6030, lng: 3.3495 },
        { lat: 6.6025, lng: 3.3480 },
        { lat: 6.6020, lng: 3.3465 },
      ],
    },
  ];
  
  // Street-level distribution lines in Lagos Island area
  const lagosIslandStreetLines = [
    {
      id: 'lagosisland-street1',
      name: 'Broad Street Line',
      type: 'Street Distribution',
      area: 'Lagos Island',
      path: [
        { lat: 6.4550, lng: 3.3941 }, // Connects to main line
        { lat: 6.4540, lng: 3.3932 },
        { lat: 6.4530, lng: 3.3923 },
        { lat: 6.4520, lng: 3.3914 },
      ],
    },
    {
      id: 'lagosisland-street2',
      name: 'Marina Line',
      type: 'Street Distribution',
      area: 'Lagos Island',
      path: [
        { lat: 6.4498, lng: 3.4026 }, // Connects to main line
        { lat: 6.4488, lng: 3.4020 },
        { lat: 6.4478, lng: 3.4014 },
        { lat: 6.4468, lng: 3.4008 },
      ],
    },
    {
      id: 'lagosisland-street3',
      name: 'Nnamdi Azikiwe Street Line',
      type: 'Street Distribution',
      area: 'Lagos Island',
      path: [
        { lat: 6.4540, lng: 3.3932 }, // Connects to Broad Street
        { lat: 6.4535, lng: 3.3922 },
        { lat: 6.4530, lng: 3.3912 },
        { lat: 6.4525, lng: 3.3902 },
      ],
    },
  ];
  
  // Street-level distribution lines in Mainland area
  const mainlandStreetLines = [
    {
      id: 'mainland-street1',
      name: 'Herbert Macaulay Line',
      type: 'Street Distribution',
      area: 'Mainland',
      path: [
        { lat: 6.5008, lng: 3.3792 }, // Connects to main line
        { lat: 6.5003, lng: 3.3782 },
        { lat: 6.4998, lng: 3.3772 },
        { lat: 6.4993, lng: 3.3762 },
      ],
    },
    {
      id: 'mainland-street2',
      name: 'Ikorodu Road Line',
      type: 'Street Distribution',
      area: 'Mainland',
      path: [
        { lat: 6.5089, lng: 3.3698 }, // Connects to main line
        { lat: 6.5085, lng: 3.3688 },
        { lat: 6.5080, lng: 3.3678 },
        { lat: 6.5075, lng: 3.3668 },
      ],
    },
    {
      id: 'mainland-street3',
      name: 'Western Avenue Line',
      type: 'Street Distribution',
      area: 'Mainland',
      path: [
        { lat: 6.5003, lng: 3.3782 }, // Connects to Herbert Macaulay
        { lat: 6.4998, lng: 3.3777 },
        { lat: 6.4993, lng: 3.3772 },
        { lat: 6.4988, lng: 3.3767 },
      ],
    },
  ];
  
  // Combine all lines
  return [
    ...mainLines,
    ...ikejaStreetLines,
    ...lagosIslandStreetLines,
    ...mainlandStreetLines,
  ];
}
export async function fetchTransformerData() {
  // In a real application, this would fetch from your backend API
  // For demo purposes, we're returning mock data for transformers
  return [
    // Ikeja area transformers
    {
      id: 'trans-ikeja1',
      name: 'Allen Avenue Transformer',
      position: { lat: 6.6052, lng: 3.3505 },
      capacity: 500,
      address: '123 Allen Avenue, Ikeja',
      lastMaintenance: '2025-02-15',
    },
    {
      id: 'trans-ikeja2',
      name: 'Awolowo Way Transformer',
      position: { lat: 6.6130, lng: 3.3390 },
      capacity: 750,
      address: '45 Awolowo Way, Ikeja',
      lastMaintenance: '2025-01-20',
    },
    {
      id: 'trans-ikeja3',
      name: 'Toyin Street Transformer',
      position: { lat: 6.6025, lng: 3.3480 },
      capacity: 300,
      address: '78 Toyin Street, Ikeja',
      lastMaintenance: '2025-02-28',
    },
    
    // Lagos Island transformers
    {
      id: 'trans-island1',
      name: 'Broad Street Transformer',
      position: { lat: 6.4530, lng: 3.3923 },
      capacity: 650,
      address: '22 Broad Street, Lagos Island',
      lastMaintenance: '2025-01-05',
    },
    {
      id: 'trans-island2',
      name: 'Marina Transformer',
      position: { lat: 6.4478, lng: 3.4014 },
      capacity: 800,
      address: '10 Marina Road, Lagos Island',
      lastMaintenance: '2025-02-10',
    },
    {
      id: 'trans-island3',
      name: 'Nnamdi Azikiwe Transformer',
      position: { lat: 6.4530, lng: 3.3912 },
      capacity: 400,
      address: '56 Nnamdi Azikiwe Street, Lagos Island',
      lastMaintenance: '2025-01-18',
    },
    
    // Mainland transformers
    {
      id: 'trans-mainland1',
      name: 'Herbert Macaulay Transformer',
      position: { lat: 6.4998, lng: 3.3772 },
      capacity: 550,
      address: '34 Herbert Macaulay Way, Yaba',
      lastMaintenance: '2025-02-20',
    },
    {
      id: 'trans-mainland2',
      name: 'Ikorodu Road Transformer',
      position: { lat: 6.5080, lng: 3.3678 },
      capacity: 700,
      address: '89 Ikorodu Road, Shomolu',
      lastMaintenance: '2025-01-12',
    },
    {
      id: 'trans-mainland3',
      name: 'Western Avenue Transformer',
      position: { lat: 6.4993, lng: 3.3772 },
      capacity: 450,
      address: '67 Western Avenue, Surulere',
      lastMaintenance: '2025-01-28',
    },
    
    // Ajah transformers
    {
      id: 'trans-ajah1',
      name: 'Lekki Phase 1 Transformer',
      position: { lat: 6.4789, lng: 3.5598 },
      capacity: 600,
      address: '123 Admiralty Way, Lekki Phase 1',
      lastMaintenance: '2025-02-05',
    },
    {
      id: 'trans-ajah2',
      name: 'Ajah Roundabout Transformer',
      position: { lat: 6.4901, lng: 3.5523 },
      capacity: 500,
      address: 'Ajah Roundabout, Lekki',
      lastMaintenance: '2025-01-25',
    },
    
    // Ikorodu transformers
    {
      id: 'trans-ikorodu1',
      name: 'Ikorodu Central Transformer',
      position: { lat: 6.6105, lng: 3.4952 },
      capacity: 450,
      address: '56 Lagos Road, Ikorodu',
      lastMaintenance: '2025-02-18',
    },
    {
      id: 'trans-ikorodu2',
      name: 'Ijede Road Transformer',
      position: { lat: 6.6198, lng: 3.4844 },
      capacity: 350,
      address: '23 Ijede Road, Ikorodu',
      lastMaintenance: '2025-01-15',
    },
  ];
}

export async function fetchPowerStatus() {
  // In a real application, this would fetch from your backend API
  // For demo purposes, we're returning mock data
  
  // Generate random status data for power lines
  const powerLineStatuses = {};
  
  // Get all power line IDs from the fetchPowerLineData function
  const powerLines = await fetchPowerLineData();
  powerLines.forEach(line => {
    // Generate random status (80% chance of being active for main lines, 70% for street lines)
    const isMainLine = line.type === 'Transmission' || line.type === 'Distribution';
    const activeChance = isMainLine ? 0.8 : 0.7;
    const isActive = Math.random() < activeChance;
    
    // Generate random voltage and load based on line type
    let voltage, load;
    if (line.type === 'Transmission') {
      voltage = Math.floor(Math.random() * (330 - 132) + 132); // 132 kV to 330 kV
      load = Math.floor(Math.random() * (800 - 300) + 300); // 300 MW to 800 MW
    } else if (line.type === 'Distribution') {
      voltage = Math.floor(Math.random() * (33 - 11) + 11); // 11 kV to 33 kV
      load = Math.floor(Math.random() * (100 - 30) + 30); // 30 MW to 100 MW
    } else { // Street Distribution
      voltage = Math.floor(Math.random() * (11 - 0.415) + 0.415); // 0.415 kV to 11 kV
      load = Math.floor(Math.random() * (30 - 5) + 5); // 5 MW to 30 MW
    }
    
    powerLineStatuses[line.id] = {
      active: isActive,
      voltage: voltage,
      load: load,
      lastUpdated: new Date().toISOString(),
    };
  });
  
  // Generate random status data for transformers
  const transformerStatuses = {};
  
  // Get all transformer IDs from the fetchTransformerData function
  const transformers = await fetchTransformerData();
  transformers.forEach(transformer => {
    // Generate random status (75% chance of being active)
    const isActive = Math.random() < 0.75;
    
    // Generate random load percentage based on capacity
    const load = Math.floor(Math.random() * (90 - 30) + 30); // 30% to 90% load
    
    transformerStatuses[transformer.id] = {
      active: isActive,
      load: load,
      lastUpdated: new Date().toISOString(),
    };
  });
  
  // Combine all statuses
  return {
    ...powerLineStatuses,
    ...transformerStatuses,
  };
}

export async function updatePowerLineStatus(lineId, isActive) {
  // In a real application, this would send an update to your backend API
  // For demo purposes, we'll simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (you would handle failures in a real application)
  return { success: true };
}

export async function updateTransformerStatus(transformerId, isActive) {
  // In a real application, this would send an update to your backend API
  // For demo purposes, we'll simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (you would handle failures in a real application)
  return { success: true };
}

