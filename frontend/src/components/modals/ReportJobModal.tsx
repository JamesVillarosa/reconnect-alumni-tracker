import React, { useContext, useState } from 'react';
import { ReportCategoryEnum, reportJobDetails, ReportStatusEnum } from '../../types/reportJob';
import Button from '../Button';
import { X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toastPromise } from '../../pages/utils/ToastFxn';

/**
 * Modal component for reporting inappropriate or problematic job postings
 * @component
 * @param {string} _jobId - ID of the job being reported
 * @param {string} jobTitle - Title of the job being reported
 * 
 * @example
 * <ReportJobModal 
 *   _jobId="123abc" 
 *   jobTitle="Software Engineer Position" 
 * />
 */
const ReportJobModal: React.FC<{ _jobId: string; jobTitle: string }> = ({ _jobId, jobTitle }) => {
  const authContext  = useContext(AuthContext); 
  const modalId = `report_modal_${_jobId}`;

  // State management
  const [selectedCategories, setSelectedCategories] = useState<ReportCategoryEnum[]>([]);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

   /**
   * Resets all form fields and error state
   */
  const resetState = () => {
    setSelectedCategories([]);
    setDescription('');
    setError('');
  };

  /**
   * Handles category checkbox selection/deselection
   * @param {ReportCategoryEnum} category - The report category being toggled
   */
  const handleCategoryChange = (category: ReportCategoryEnum) => {
    setError('');
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  /**
   * Handles form submission for job reporting
   * @async
   * @throws {Error} If user is not authenticated or API request fails
   */
  const handleSubmit = async () => {
    // frontend validation
    if (selectedCategories.includes(ReportCategoryEnum.other) && description.trim() === '') {
      setError('Please specify your problem.');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one category.');
      return;
    }

    // get current user
    const currentUser = authContext?.user;
    if(!currentUser) {
      console.log("Error: You need to be logged in to report a job.");
      return;
    }

    // backend request
    try {
      const reportDetails: reportJobDetails = {
        _jobId: _jobId,
        _userId: currentUser._id, 
        category: selectedCategories,
        description: description,
        status: ReportStatusEnum.pending,
        created_at: new Date(),
        updated_at: new Date()
      };

      toastPromise(
        axios.post(
          `${import.meta.env.VITE_API_URL}/jobs/report`,
          reportDetails,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        ),
        {
          loading: {
            title: "Reporting...",
            description: "Job post is being reported.",
            type: "info",
          },
          success: {
            title: "Success!",
            description: "Job post reported successfully.",
            type: "success",
          },
          error: {
            title: "Failed!",
            description: "There was an error reporting the job.",
            type: "error",
          },
        }
      )
      .then((response) => {
        console.log(response.data.message)
        resetState();
        (document.getElementById(modalId) as HTMLDialogElement).close();
      })

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) 
          console.log(error.response?.data?.detail || 'You already submitted a report for this job. Please wait for it to be reviewed.');
        else 
          console.log(error.response?.data?.detail || 'Failed to submit job report.');
      } else {
        console.log('An unexpected error occurred.');
      }
    }

  };

  return (
    <div className='flex items-center justify-center'>
        <div className="fixed inset-0 bg-Gradient2 opacity-80"></div>
        <form method="dialog" className="modal-box w-11/12 max-w-lg bg-white rounded-4xl relative z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg sm:text-xl text-primary">Report Job Posting</h3>
          {/* Close Button (Desktop Only) */}
          <button
            type="button"
            className="hidden sm:block text-gray-500 hover:text-gray-700 transition cursor-pointer"
            onClick={() => {
              resetState();
              (document.getElementById(modalId) as HTMLDialogElement).close();
            }}
          >
            <X size={25} /> 
          </button>
        </div>
        {/* Horizontal Line (Desktop Only) */}
        <hr className="hidden sm:block border-gray-300 mb-4" />

          {/* Job Title */}
          <p className="text-sm sm:text-md font-semibold text-primary mb-4">{jobTitle}</p>

          {/* Report Categories */}
          <div className="form-control mb-4 space-y-3">
            {Object.values(ReportCategoryEnum).map((category) => (
              <label key={category} className="label cursor-pointer flex items-center">
                <input
                  type="checkbox"
                  name={`reportCategory-${_jobId}`}
                  className="checkbox checkbox-primary border border-primary rounded-lg text-white"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="label-text ml-3 text-xs sm:text-sm text-primary">{category}</span>
              </label>
            ))}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm sm:text-md text-primary font-semibold">
                Describe your problem below:
              </span>
            </label>
            <textarea
              className="textarea h-40 resize-none border border-primary rounded-3xl mt-3 w-full"
              placeholder="Enter your problem here..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (selectedCategories.includes(ReportCategoryEnum.other)) setError('');
              }}
              maxLength={300}
            />
            <div className="text-right text-xs mt-1 text-gray-500">{description.length}/300</div>
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col justify-between items-center space-y-3">
            <Button
              variant="major"
              onClick={handleSubmit}
              type="button"
              className="cursor-pointer transition"
            >
              Submit
            </Button>
            <button
              type="button"
              className="w-full text-center text-primary cursor-pointer transition"
              onClick={() => {
                resetState();
                (document.getElementById(modalId) as HTMLDialogElement).close();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
    </div>
  );
};

export default ReportJobModal;