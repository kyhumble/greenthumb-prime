import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

function AddPlantDialog() {
  // Other component code...

  const { data: res } = useMyQuery(); // Assume this is the data fetching logic
  const plant = res?.data; // This is line 135

  // Remove duplicate declaration
  // const plant = res?.data; // Removed line 140

  return (
    <Dialog>
      <DialogHeader>Title</DialogHeader>
      <DialogContent>
        {/* Other content */}
      </DialogContent>
    </Dialog>
  );
}

export default AddPlantDialog;