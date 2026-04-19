import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { ShopifyCustomerAddress } from '@/hooks/useShopifyCustomer';

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAddress: ShopifyCustomerAddress | null;
  executeQuery: (query: string, variables?: Record<string, unknown>) => Promise<unknown>;
  onSuccess: () => void;
}

const ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export function AddressModal({ open, onOpenChange, currentAddress, executeQuery, onSuccess }: AddressModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    address1: '',
    address2: '',
    city: '',
    zip: '',
    countryCode: 'FR',
    provinceCode: '',
  });

  const isEdit = !!currentAddress;

  useEffect(() => {
    if (currentAddress) {
      setForm({
        address1: currentAddress.address1 || '',
        address2: currentAddress.address2 || '',
        city: currentAddress.city || '',
        zip: currentAddress.zip || '',
        countryCode: currentAddress.country || 'FR',
        provinceCode: currentAddress.province || '',
      });
    } else {
      setForm({ address1: '', address2: '', city: '', zip: '', countryCode: 'FR', provinceCode: '' });
    }
  }, [currentAddress, open]);

  const handleSave = async () => {
    if (!form.address1 || !form.city || !form.zip) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const addressInput: Record<string, unknown> = {
        address1: form.address1,
        address2: form.address2 || null,
        city: form.city,
        zip: form.zip,
        territoryCode: form.countryCode,
      };
      if (form.provinceCode) {
        addressInput.zoneCode = form.provinceCode;
      }

      // The Customer Account API uses customerAddressCreate for new addresses
      const result = await executeQuery(ADDRESS_CREATE_MUTATION, {
        address: addressInput,
        defaultAddress: true,
      }) as { data?: { customerAddressCreate?: { userErrors?: Array<{ message: string }> } } };

      const errors = result?.data?.customerAddressCreate?.userErrors;
      if (errors && errors.length > 0) {
        toast.error(errors[0].message);
        return;
      }

      toast.success(isEdit ? 'Adresse mise à jour' : 'Adresse ajoutée');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Address save error:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l\'adresse' : 'Ajouter une adresse'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="address1">Adresse *</Label>
            <Input
              id="address1"
              value={form.address1}
              onChange={(e) => setForm(f => ({ ...f, address1: e.target.value }))}
              placeholder="12 Rue de la Paix"
            />
          </div>
          <div>
            <Label htmlFor="address2">Complément</Label>
            <Input
              id="address2"
              value={form.address2}
              onChange={(e) => setForm(f => ({ ...f, address2: e.target.value }))}
              placeholder="Appartement 3B"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="zip">Code postal *</Label>
              <Input
                id="zip"
                value={form.zip}
                onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))}
                placeholder="75001"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="New York"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Code pays</Label>
            <Input
              id="country"
              value={form.countryCode}
              onChange={(e) => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase() }))}
              placeholder="FR"
              maxLength={2}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
