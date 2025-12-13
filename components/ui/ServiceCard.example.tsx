'use client';

import React, { useState } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceGrid, ServiceGridItem } from './ServiceGrid';
import { CardContainer } from './CardContainer';
import { Pagination } from './Pagination';

const exampleServices: ServiceGridItem[] = [
  {
    id: '1',
    icon: '/images/service-icons/geriatric-health.svg',
    title: 'Geriatric Health Panels',
    description: 'With a team of highly trained pathologists technology provide of full of laboratory services',
    href: '/services/geriatric-health-panels',
    variant: 'mint',
  },
  {
    id: '2',
    icon: '/images/service-icons/oncology.svg',
    title: 'Oncology Testing',
    description: 'With a team of highly trained pathologists technology provide of full of laboratory services',
    href: '/services/oncology-testing',
    variant: 'beige',
  },
  {
    id: '3',
    icon: '/images/service-icons/infectious-disease.svg',
    title: 'Infectious Disease Testing',
    description: 'With a team of highly trained pathologists technology provide of full of laboratory services',
    href: '/services/infectious-disease-testing',
    variant: 'green',
  },
  {
    id: '4',
    icon: '/images/service-icons/routine-health.svg',
    title: 'Routine Health Screenings',
    description: 'With a team of highly trained pathologists technology provide of full of laboratory services',
    href: '/services/routine-health-screenings',
    variant: 'purple',
  },
];

export default function ServiceCardExample() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Example 1: Grid Layout with Pagination */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Grid Layout with Pagination</h2>
        <ServiceGrid items={exampleServices} animationDelay={true} />
        <Pagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
          variant="pills"
          className="mt-8"
        />
      </section>

      {/* Example 2: Flex Layout */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Flex Layout (Centered)</h2>
        <CardContainer layout="flex" gap="lg" justifyContent="center">
          {exampleServices.slice(0, 3).map((service) => (
            <div key={service.id} className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]">
              <ServiceCard {...service} />
            </div>
          ))}
        </CardContainer>
      </section>

      {/* Example 3: Individual Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Individual Cards (Custom Layout)</h2>
        <div className="space-y-4">
          <ServiceCard
            icon="/images/service-icons/covid.svg"
            title="COVID-19 Testing"
            description="With a team of highly trained pathologists technology provide of full of laboratory services"
            href="/services/covid-19"
            variant="purple"
            showLearnMore={false}
          />
        </div>
      </section>

      {/* Example 4: 2-Column Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">2-Column Grid</h2>
        <ServiceGrid
          items={exampleServices}
          columns={{ sm: 1, md: 2, lg: 2, xl: 2 }}
        />
      </section>
    </div>
  );
}
