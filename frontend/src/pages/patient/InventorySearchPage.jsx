import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Hospital, Droplet, MapPin, Phone } from 'lucide-react';
import { inventoryApi } from '@/api/inventory.api';
import { BLOOD_GROUPS } from '@/lib/constants';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Select from '@/components/forms/Select';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const InventorySearchPage = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O_POSITIVE');

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['inventory', 'search', selectedBloodGroup],
    queryFn: () => inventoryApi.searchInventory(selectedBloodGroup),
    enabled: Boolean(selectedBloodGroup),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Search Available Hospital Blood Stock
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Query verified medical centers with available inventory units in real time.
        </p>
      </div>

      <Card className="p-4">
        <div className="max-w-xs">
          <Select
            id="searchBloodGroup"
            label="Filter by Blood Group"
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            options={BLOOD_GROUPS.map((b) => ({
              value: b.code,
              label: `${b.label} (${b.code})`,
            }))}
          />
        </div>
      </Card>

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          Failed to fetch available blood units.
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="No available units found"
          description={`There are currently no verified hospitals reporting available stock (>0 units) for ${selectedBloodGroup}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <Card key={item.id} className="p-5 border-charcoal-200 hover:border-crimson-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 bg-crimson-50 text-crimson-700 rounded-xl">
                  <Hospital className="w-5 h-5" />
                </div>
                <Badge variant="primary" size="lg" className="font-black text-sm">
                  {item.bloodGroup || item.bloodGroupCode}
                </Badge>
              </div>

              <h3 className="font-bold text-charcoal-900 text-base mb-1">
                {item.hospitalName}
              </h3>

              <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between text-sm">
                <span className="text-charcoal-500">Available Stock:</span>
                <span className="font-extrabold text-emerald-600 text-base">
                  {item.availableUnits} {item.availableUnits === 1 ? 'unit' : 'units'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventorySearchPage;
